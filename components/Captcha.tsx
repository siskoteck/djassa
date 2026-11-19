"use client";

export const CAPTCHA_ACTIF = false;

interface CaptchaProps {
  onVerify?: (token: string) => void;
  onExpire?: () => void;
}

export default function Captcha({ onVerify }: CaptchaProps) {
  if (!CAPTCHA_ACTIF) return null;
  if (onVerify) {
    // Placeholder when captcha is disabled
  }
  return null;
}
