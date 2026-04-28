import { useId } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import { styled, useTheme } from '@mui/material/styles';
import Link, { type LinkProps } from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const theme = useTheme();

  const uniqueId = useId();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  /*
    * OR using local (public folder)
    *
    const singleLogo = (
      <img
        alt="Single logo"
        src={`${CONFIG.assetsDir}/logo/logo-single.svg`}
        width="100%"
        height="100%"
      />
    );

    const fullLogo = (
      <img
        alt="Full logo"
        src={`${CONFIG.assetsDir}/logo/logo-full.svg`}
        width="100%"
        height="100%"
      />
    );
    *
    */

  const singleLogo = (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Moon body gradient — deep at lower-left, glowing at upper-right */}
        <linearGradient
          id={`${uniqueId}-1`}
          x1="110"
          y1="410"
          x2="380"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_DARKER} />
          <stop offset="0.55" stopColor={PRIMARY_MAIN} />
          <stop offset="1" stopColor={PRIMARY_LIGHT} />
        </linearGradient>
        {/* Cradled moment — radial glow */}
        <radialGradient
          id={`${uniqueId}-2`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(338 178) rotate(90) scale(38 38)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_LIGHT} />
          <stop offset="1" stopColor={PRIMARY_MAIN} />
        </radialGradient>
        {/* Crescent mask: full disk minus an offset disk */}
        <mask
          id={`${uniqueId}-mask`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="512"
          height="512"
        >
          <rect width="512" height="512" fill="black" />
          <circle cx="256" cy="256" r="176" fill="white" />
          <circle cx="332" cy="180" r="152" fill="black" />
        </mask>
      </defs>

      {/* Faint orbit — the unseen passage of time */}
      <circle
        cx="256"
        cy="256"
        r="212"
        stroke={PRIMARY_LIGHT}
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />

      {/* Crescent moon — the vessel of time */}
      <rect
        width="512"
        height="512"
        fill={`url(#${`${uniqueId}-1`})`}
        mask={`url(#${`${uniqueId}-mask`})`}
      />

      {/* Cradled moment — a single luminous instant */}
      <circle cx="338" cy="178" r="30" fill={`url(#${`${uniqueId}-2`})`} />

      {/* Drifting stardust — moments slipping away */}
      <circle cx="402" cy="118" r="9" fill={PRIMARY_MAIN} opacity="0.85" />
      <circle cx="446" cy="82" r="6" fill={PRIMARY_MAIN} opacity="0.6" />
      <circle cx="478" cy="56" r="3.5" fill={PRIMARY_MAIN} opacity="0.4" />
    </svg>
  );

  const fullLogo = (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 360 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`${uniqueId}-1`}
          x1="22"
          y1="100"
          x2="94"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_DARKER} />
          <stop offset="0.55" stopColor={PRIMARY_MAIN} />
          <stop offset="1" stopColor={PRIMARY_LIGHT} />
        </linearGradient>
        <radialGradient
          id={`${uniqueId}-2`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(82 46) rotate(90) scale(8 8)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={PRIMARY_LIGHT} />
          <stop offset="1" stopColor={PRIMARY_MAIN} />
        </radialGradient>
        <mask
          id={`${uniqueId}-mask`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="128"
          height="128"
        >
          <rect width="128" height="128" fill="black" />
          <circle cx="58" cy="64" r="40" fill="white" />
          <circle cx="76" cy="46" r="34" fill="black" />
        </mask>
      </defs>

      {/* Faint orbit */}
      <circle
        cx="58"
        cy="64"
        r="50"
        stroke={PRIMARY_LIGHT}
        strokeWidth="1"
        strokeDasharray="1 4"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />

      {/* Crescent moon */}
      <rect
        width="128"
        height="128"
        fill={`url(#${`${uniqueId}-1`})`}
        mask={`url(#${`${uniqueId}-mask`})`}
      />

      {/* Cradled moment */}
      <circle cx="82" cy="46" r="7" fill={`url(#${`${uniqueId}-2`})`} />

      {/* Stardust */}
      <circle cx="96" cy="32" r="2.4" fill={PRIMARY_MAIN} opacity="0.85" />
      <circle cx="106" cy="23" r="1.6" fill={PRIMARY_MAIN} opacity="0.6" />
      <circle cx="114" cy="16" r="1" fill={PRIMARY_MAIN} opacity="0.4" />

      {/* Wordmark "yori" */}
      <text
        x="140"
        y="86"
        fontFamily="'Plus Jakarta Sans', 'Public Sans', system-ui, sans-serif"
        fontSize="60"
        fontWeight="600"
        letterSpacing="-1"
        fill={TEXT_PRIMARY}
      >
        yori
      </text>
    </svg>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 102, height: 36 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
