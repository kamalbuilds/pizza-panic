"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn, shortenAddress, getAgentColor } from "@/lib/utils";
import { Target, Check, X, Users, Trophy } from "lucide-react";
import type { Player, GamePhase, PredictionResult } from "@/lib/types";

interface PredictionPanelProps {
  players: Player[];
  phase: GamePhase | null;
  winner: "lobsters" | "impostor" | null;
  predictions: { count: number };
  predictionResults: PredictionResult[] | null;
  onPredict: (targetAddress: string, spectatorAddress?: string) => void;
}

export default function PredictionPanel({
  players,
  phase,
  winner,
  predictions,
  predictionResults,
  onPredict,
}: PredictionPanelProps) {
  const { address, isConnected } = useAccount();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const alivePlayers = players.filter((p) => p.isAlive);
  const gameActive = phase && phase !== "results" && phase !== "lobby";
  const gameEnded = phase === "results" || winner !== null;

  // Find this spectator's result
  const myResult = predictionResults?.find(
    (r) => r.spectatorAddress?.toLowerCase() === address?.toLowerCase()
  );

  // Top 5 leaderboard from results
  const leaderboard = predictionResults
    ? [...predictionResults]
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)
    : [];

  function handlePredict(targetAddress: string) {
    setSelectedTarget(targetAddress);
    onPredict(targetAddress, address);
  }

  return (
    <div className="gradient-border overflow-hidden">
      <div className="glass-card card-shine rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-white/[0.06] p-5">
          <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-orange-500/10 blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/[0.08] border border-orange-500/20">
              <Target className="h-5 w-5 neon-orange" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">
                Guess the Saboteur
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Predict who is sabotaging
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Not connected state */}
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-2xl animate-pulse-glow" />
                <Target className="relative h-12 w-12 text-gray-600" />
              </div>
              <p className="text-sm text-gray-400 text-center max-w-[200px]">
                Connect wallet to predict
              </p>
              <div className="mt-2">
                <ConnectButton />
              </div>
            </motion.div>
          ) : gameEnded && predictionResults ? (
            /* Results view */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* My result */}
              {myResult ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "rounded-xl p-4 text-center border",
                    myResult.correct
                      ? "bg-green-500/[0.08] border-green-500/20"
                      : "bg-red-500/[0.08] border-red-500/20"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {myResult.correct ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-400" />
                    )}
                    <span
                      className={cn(
                        "font-bold text-sm",
                        myResult.correct ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {myResult.correct ? "You got it right!" : "Better luck next time!"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    +{myResult.points} points
                  </p>
                </motion.div>
              ) : (
                <div className="rounded-xl p-4 text-center border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-sm text-gray-400">You didn&apos;t make a prediction</p>
                </div>
              )}

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold">
                      Top Predictors
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {leaderboard.map((result, idx) => (
                      <motion.div
                        key={result.spectatorId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg p-2.5",
                          "border transition-all duration-200",
                          result.correct
                            ? "border-green-500/15 bg-green-500/[0.04]"
                            : "border-white/[0.04] bg-white/[0.02]"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-black w-5 text-center",
                            idx === 0 && "text-yellow-400",
                            idx === 1 && "text-gray-300",
                            idx === 2 && "text-orange-400",
                            idx > 2 && "text-gray-500"
                          )}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-xs text-gray-300 truncate flex-1">
                          {result.spectatorAddress
                            ? shortenAddress(result.spectatorAddress)
                            : result.spectatorId.slice(0, 8)}
                        </span>
                        {result.correct ? (
                          <Check className="h-3 w-3 text-green-400 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-red-400/50 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-bold tabular-nums",
                            result.correct ? "text-green-400" : "text-gray-600"
                          )}
                        >
                          {result.points}pt
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Active game - player selection grid */
            <>
              {/* Current selection */}
              <AnimatePresence>
                {selectedTarget && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-orange-500/30 bg-orange-500/[0.06] p-3 flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 border"
                        style={{
                          backgroundColor: `${getAgentColor(selectedTarget)}25`,
                          color: getAgentColor(selectedTarget),
                          borderColor: `${getAgentColor(selectedTarget)}50`,
                        }}
                      >
                        {selectedTarget.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-orange-300 font-medium truncate">
                          Your pick:{" "}
                          <span className="text-white">
                            {players.find((p) => p.address === selectedTarget)?.name ||
                              shortenAddress(selectedTarget)}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTarget(null)}
                        className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold uppercase tracking-wider transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Player grid */}
              {!selectedTarget && (
                <div className="space-y-2.5">
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold">
                    Who is the saboteur?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {alivePlayers.map((player) => {
                      const pColor = getAgentColor(player.address);
                      return (
                        <motion.button
                          key={player.address}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handlePredict(player.address)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl border p-3",
                            "transition-all duration-200 text-center",
                            "border-white/[0.06] bg-white/[0.02]",
                            "hover:border-orange-500/30 hover:bg-orange-500/[0.04]"
                          )}
                        >
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-[9px] font-black border"
                            style={{
                              background: `radial-gradient(circle at 35% 35%, ${pColor}35, ${pColor}10)`,
                              color: pColor,
                              borderColor: `${pColor}35`,
                              boxShadow: `0 0 6px ${pColor}15`,
                            }}
                          >
                            {player.address.slice(2, 4).toUpperCase()}
                          </div>
                          <span className="text-[11px] text-gray-300 font-medium truncate w-full">
                            {player.name || shortenAddress(player.address)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {alivePlayers.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-600">No alive players</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prediction count */}
              {predictions.count > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <Users className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-[11px] text-gray-500">
                    {predictions.count} spectator{predictions.count !== 1 ? "s" : ""} guessing
                  </span>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
