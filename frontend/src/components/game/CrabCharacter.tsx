"use client";

import { useCallback } from "react";
import type { Graphics } from "pixi.js";
import { darkenColor, lightenColor } from "./pixiSetup";

interface CrabCharacterProps {
  x: number;
  y: number;
  color: number;
  isAlive: boolean;
  isSpeaking: boolean;
  scale: number;
  bobOffset: number;
  clawAngle: number;
  glowIntensity: number;
  facingAngle: number;
}

export default function CrabCharacter({
  x,
  y,
  color,
  isAlive,
  isSpeaking,
  scale,
  bobOffset,
  clawAngle,
  glowIntensity,
  facingAngle,
}: CrabCharacterProps) {
  const darker = darkenColor(color, 0.6);
  const darkest = darkenColor(color, 0.4);
  const lighter = lightenColor(color, 1.3);
  const lightest = lightenColor(color, 1.6);
  const alpha = isAlive ? 1.0 : 0.3;

  // Pizza-specific colors
  const crustColor = darkenColor(color, 0.7);
  const crustDark = darkenColor(color, 0.5);
  const cheeseColor = lightenColor(color, 1.4);
  const pepperoniColor = darkenColor(color, 0.45);

  // Body dimensions
  const bodyW = 36;
  const bodyH = 40;

  // Spot seed from color for deterministic pepperoni placement
  const spotSeed = (color >> 4) & 0xf;

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      // ═══ Speaking glow ring ═══
      if (isSpeaking && glowIntensity > 0) {
        g.circle(0, 2, 38);
        g.fill({ color: 0x22c55e, alpha: glowIntensity * 0.12 });
        g.circle(0, 2, 32);
        g.fill({ color: 0x22c55e, alpha: glowIntensity * 0.08 });
      }

      // ═══ SHADOW ═══
      if (isAlive) {
        g.ellipse(0, bodyH * 0.4 + 6, 20, 5);
        g.fill({ color: 0x000000, alpha: 0.2 });
      }

      // ═══ ARMS (animated with clawAngle) ═══
      const armSwing = Math.sin(clawAngle) * 8;

      // --- Left arm ---
      // Upper arm
      g.moveTo(-bodyW * 0.45, bodyH * 0.0);
      g.lineTo(-bodyW * 0.45 - 12, bodyH * 0.05 + armSwing);
      g.stroke({ color: darker, width: 3, alpha });
      // Forearm
      g.moveTo(-bodyW * 0.45 - 12, bodyH * 0.05 + armSwing);
      g.lineTo(-bodyW * 0.45 - 18, bodyH * 0.0 - 4 + armSwing * 0.5);
      g.stroke({ color: darker, width: 2.5, alpha });
      // Hand (small circle)
      g.circle(-bodyW * 0.45 - 18, bodyH * 0.0 - 4 + armSwing * 0.5, 3);
      g.fill({ color: lighter, alpha });
      g.circle(-bodyW * 0.45 - 18, bodyH * 0.0 - 4 + armSwing * 0.5, 3);
      g.stroke({ color: darker, width: 1, alpha });

      // --- Right arm ---
      // Upper arm
      g.moveTo(bodyW * 0.45, bodyH * 0.0);
      g.lineTo(bodyW * 0.45 + 12, bodyH * 0.05 - armSwing);
      g.stroke({ color: darker, width: 3, alpha });
      // Forearm
      g.moveTo(bodyW * 0.45 + 12, bodyH * 0.05 - armSwing);
      g.lineTo(bodyW * 0.45 + 18, bodyH * 0.0 - 4 - armSwing * 0.5);
      g.stroke({ color: darker, width: 2.5, alpha });
      // Hand (small circle)
      g.circle(bodyW * 0.45 + 18, bodyH * 0.0 - 4 - armSwing * 0.5, 3);
      g.fill({ color: lighter, alpha });
      g.circle(bodyW * 0.45 + 18, bodyH * 0.0 - 4 - armSwing * 0.5, 3);
      g.stroke({ color: darker, width: 1, alpha });

      // ═══ PIZZA SLICE BODY (triangle) ═══
      // Tip at top, wide bottom (crust end)
      const tipY = -bodyH * 0.6;
      const baseY = bodyH * 0.4;
      const halfW = bodyW * 0.5;

      // Main slice shape
      g.moveTo(0, tipY);
      g.lineTo(-halfW, baseY);
      g.lineTo(halfW, baseY);
      g.closePath();
      g.fill({ color, alpha });

      // Slice outline
      g.moveTo(0, tipY);
      g.lineTo(-halfW, baseY);
      g.lineTo(halfW, baseY);
      g.closePath();
      g.stroke({ color: darker, width: 1.5, alpha });

      // ═══ CHEESE TOPPING (lighter upper portion) ═══
      // A smaller triangle covering the top ~60% of the slice
      const cheeseBaseY = baseY * 0.4;
      // Calculate the width at cheeseBaseY by interpolating the triangle edges
      const t = (cheeseBaseY - tipY) / (baseY - tipY);
      const cheeseHalfW = halfW * t;

      g.moveTo(0, tipY + 2);
      g.lineTo(-cheeseHalfW + 1, cheeseBaseY);
      g.lineTo(cheeseHalfW - 1, cheeseBaseY);
      g.closePath();
      g.fill({ color: cheeseColor, alpha: alpha * 0.35 });

      // ═══ CRUST (thick arc at bottom) ═══
      // Draw a thick band at the bottom of the slice
      const crustTop = baseY - 6;
      // Calculate width at crustTop
      const tCrust = (crustTop - tipY) / (baseY - tipY);
      const crustTopHalfW = halfW * tCrust;

      g.moveTo(-crustTopHalfW, crustTop);
      g.lineTo(-halfW, baseY);
      g.lineTo(halfW, baseY);
      g.lineTo(crustTopHalfW, crustTop);
      g.closePath();
      g.fill({ color: crustColor, alpha });
      // Crust outline
      g.moveTo(-crustTopHalfW, crustTop);
      g.lineTo(-halfW, baseY);
      g.lineTo(halfW, baseY);
      g.lineTo(crustTopHalfW, crustTop);
      g.closePath();
      g.stroke({ color: crustDark, width: 1, alpha });

      // Crust highlight line
      g.moveTo(-crustTopHalfW + 2, crustTop + 1.5);
      g.lineTo(crustTopHalfW - 2, crustTop + 1.5);
      g.stroke({ color: lightest, width: 1, alpha: alpha * 0.2 });

      // ═══ SLICE HIGHLIGHT (top-left sheen) ═══
      g.ellipse(-4, -bodyH * 0.15, 6, 8);
      g.fill({ color: 0xffffff, alpha: 0.12 * (isAlive ? 1 : 0.3) });

      // Small highlight spot
      g.circle(-6, -bodyH * 0.25, 2.5);
      g.fill({ color: 0xffffff, alpha: 0.18 * (isAlive ? 1 : 0.3) });

      // ═══ PEPPERONI (positioned using spotSeed) ═══
      // Always draw at least 2 pepperoni, up to 3 based on spotSeed
      const pepR = 3.2;

      // Pepperoni 1: upper-left area
      const pep1X = -4 + (spotSeed % 3);
      const pep1Y = -bodyH * 0.1 + (spotSeed % 4);
      g.circle(pep1X, pep1Y, pepR);
      g.fill({ color: pepperoniColor, alpha });
      g.circle(pep1X, pep1Y, pepR);
      g.stroke({ color: darkest, width: 0.8, alpha: alpha * 0.6 });
      // Pepperoni highlight
      g.circle(pep1X - 1, pep1Y - 1, 1);
      g.fill({ color: lighter, alpha: alpha * 0.3 });

      // Pepperoni 2: right area
      const pep2X = 5 + (spotSeed % 2);
      const pep2Y = bodyH * 0.05 + (spotSeed % 3);
      g.circle(pep2X, pep2Y, pepR - 0.4);
      g.fill({ color: pepperoniColor, alpha });
      g.circle(pep2X, pep2Y, pepR - 0.4);
      g.stroke({ color: darkest, width: 0.8, alpha: alpha * 0.6 });
      g.circle(pep2X - 1, pep2Y - 1, 0.8);
      g.fill({ color: lighter, alpha: alpha * 0.3 });

      // Pepperoni 3: only if spotSeed > 7
      if (spotSeed > 7) {
        const pep3X = -1 + (spotSeed % 2);
        const pep3Y = bodyH * 0.2;
        g.circle(pep3X, pep3Y, pepR - 0.6);
        g.fill({ color: pepperoniColor, alpha });
        g.circle(pep3X, pep3Y, pepR - 0.6);
        g.stroke({ color: darkest, width: 0.8, alpha: alpha * 0.6 });
        g.circle(pep3X - 0.8, pep3Y - 0.8, 0.8);
        g.fill({ color: lighter, alpha: alpha * 0.25 });
      }

      // ═══ EYES ═══
      // Positioned in the upper-middle area of the slice
      const eyeY = -bodyH * 0.28;
      const eyeSpacing = 7;

      // Left eye (white)
      g.circle(-eyeSpacing, eyeY, 5);
      g.fill({ color: 0xffffff, alpha });
      g.circle(-eyeSpacing, eyeY, 5);
      g.stroke({ color: darker, width: 1, alpha });
      // Left pupil
      g.circle(-eyeSpacing + 1, eyeY, 2.8);
      g.fill({ color: 0x111827, alpha });
      // Left highlight
      g.circle(-eyeSpacing + 2, eyeY - 1.5, 1.2);
      g.fill({ color: 0xffffff, alpha: alpha * 0.9 });

      // Right eye (white)
      g.circle(eyeSpacing, eyeY, 5);
      g.fill({ color: 0xffffff, alpha });
      g.circle(eyeSpacing, eyeY, 5);
      g.stroke({ color: darker, width: 1, alpha });
      // Right pupil
      g.circle(eyeSpacing + 1, eyeY, 2.8);
      g.fill({ color: 0x111827, alpha });
      // Right highlight
      g.circle(eyeSpacing + 2, eyeY - 1.5, 1.2);
      g.fill({ color: 0xffffff, alpha: alpha * 0.9 });

      // ═══ MOUTH ═══
      g.moveTo(-3, -bodyH * 0.1);
      g.quadraticCurveTo(0, -bodyH * 0.06, 3, -bodyH * 0.1);
      g.stroke({ color: darkest, width: 1.5, alpha: alpha * 0.6 });

      // ═══ CHEF HAT (toque) ═══
      // Sits on top of the pointed tip of the slice
      const hatBaseY = tipY - 1;
      const hatBandH = 5;
      const hatBandW = 10;
      const hatPuffY = hatBaseY - hatBandH;

      // Hat band (rectangle base)
      g.rect(-hatBandW / 2, hatBaseY - hatBandH, hatBandW, hatBandH);
      g.fill({ color: 0xffffff, alpha });
      g.rect(-hatBandW / 2, hatBaseY - hatBandH, hatBandW, hatBandH);
      g.stroke({ color: 0xe5e7eb, width: 0.8, alpha });

      // Hat puffy top (3 overlapping circles for classic toque shape)
      g.circle(-3.5, hatPuffY - 3, 5);
      g.fill({ color: 0xffffff, alpha });
      g.circle(3.5, hatPuffY - 3, 5);
      g.fill({ color: 0xffffff, alpha });
      g.circle(0, hatPuffY - 5, 5.5);
      g.fill({ color: 0xffffff, alpha });

      // Hat outline for the puffy part
      g.circle(-3.5, hatPuffY - 3, 5);
      g.stroke({ color: 0xe5e7eb, width: 0.8, alpha: alpha * 0.5 });
      g.circle(3.5, hatPuffY - 3, 5);
      g.stroke({ color: 0xe5e7eb, width: 0.8, alpha: alpha * 0.5 });
      g.circle(0, hatPuffY - 5, 5.5);
      g.stroke({ color: 0xe5e7eb, width: 0.8, alpha: alpha * 0.5 });

      // Hat shadow/detail line at band
      g.moveTo(-hatBandW / 2, hatBaseY);
      g.lineTo(hatBandW / 2, hatBaseY);
      g.stroke({ color: 0xd1d5db, width: 1, alpha: alpha * 0.4 });

      // ═══ Elimination X ═══
      if (!isAlive) {
        // Bigger X across the body
        g.moveTo(-12, -12);
        g.lineTo(12, 12);
        g.stroke({ color: 0xef4444, width: 3.5, alpha: 0.8 });
        g.moveTo(12, -12);
        g.lineTo(-12, 12);
        g.stroke({ color: 0xef4444, width: 3.5, alpha: 0.8 });
        // Red tint overlay on the slice shape
        g.moveTo(0, tipY);
        g.lineTo(-halfW, baseY);
        g.lineTo(halfW, baseY);
        g.closePath();
        g.fill({ color: 0xef4444, alpha: 0.15 });
      }
    },
    [
      color, darker, darkest, lighter, lightest, crustColor, crustDark,
      cheeseColor, pepperoniColor, isAlive, isSpeaking, clawAngle,
      glowIntensity, alpha, bodyW, bodyH, spotSeed,
    ]
  );

  return (
    <pixiContainer x={x} y={y + bobOffset} rotation={facingAngle} scale={scale} alpha={alpha}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
