import { CardNetwork } from '@/types/card-network';

export const CARD_NETWORK_IMAGES: Record<CardNetwork, string> = {
  [CardNetwork.ELO]: '/brandnetwork/elo.svg',
  [CardNetwork.VISA]: '/brandnetwork/visa.svg',
  [CardNetwork.MASTERCARD]: '/brandnetwork/mastercard.svg',
  [CardNetwork.MAESTRO]: '/brandnetwork/maestro.svg',
  [CardNetwork.AMEX]: '/brandnetwork/amex.svg',
  [CardNetwork.DINERS]: '/brandnetwork/dinersclub.svg',
  [CardNetwork.DISCOVER]: '/brandnetwork/discover.svg',
  [CardNetwork.JCB]: '/brandnetwork/jcb.svg',
  [CardNetwork.UNIONPAY]: '/brandnetwork/unionpay.svg',
  [CardNetwork.MIR]: '/brandnetwork/mir.svg',
  [CardNetwork.RUPAY]: '/brandnetwork/rupay.svg',
};

export const CARD_PATTERNS: Record<CardNetwork, RegExp> = {
  // ELO (Brazil)
  // BIN ranges (prefix-only):
  // - 4011, 4312, 4576
  // - 438935, 451416, 457393
  // - 504175, 506699–506778, 509xxx
  // - 636297, 636368, 65003x
  // Put before VISA/MASTERCARD because several prefixes overlap (e.g. 4011 with Visa, 509x with Mastercard).
  [CardNetwork.ELO]:
    /^(4011|4312|4576|438935|451416|457393|504175|506(699|7[0-7]\d)|509\d{3}|636297|636368|65003\d)\d*/,

  // VISA - broad 4* prefix
  // NOTE: We explicitly exclude Elo 4xxx prefixes (4011, 4312, 4389, 4514, 4573, 4576)
  // so we don't prematurely classify a card as Visa while it could still be Elo.
  [CardNetwork.VISA]: /^4(?!011|312|389|514|573|576)\d*/,

  // MASTERCARD - BINs 51–55, 2221–2720 (prefix-only approximation)
  // Checked after Maestro so Maestro-specific 50xx ranges win first.
  [CardNetwork.MASTERCARD]: /^(5[1-5]\d*|22[2-9]\d*|2[3-6]\d*|27[01]\d*|2720\d*)/,

  // MAESTRO (Mastercard debit) - starts with 5018, 5020, 5038, 5893, 6304, 6759, 6761, 6762, 6763
  [CardNetwork.MAESTRO]: /^(5018|5020|5038|5893|6304|6759|6761|6762|6763)\d*/,

  // AMEX - starts with 34 or 37 (15 digits, but we only care about prefix)
  [CardNetwork.AMEX]: /^(34|37)\d*/,

  // DINERS - starts with 36 or 38 or 300–305
  [CardNetwork.DINERS]: /^(36|38|30[0-5])\d*/,

  // DISCOVER - starts with 6011, 622126–622925, 644–649, or 65 (excluding RuPay 6521/6522)
  // This regex is a reasonably accurate prefix match for those ranges.
  [CardNetwork.DISCOVER]:
    /^((6011)|(65(?!21|22))|(64[4-9])|(622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5])))\d*/,

  // JCB - broad 2131, 1800, 35* ranges
  [CardNetwork.JCB]: /^(2131|1800|35)\d*/,

  // UNIONPAY - most UnionPay cards start with 62
  [CardNetwork.UNIONPAY]: /^62\d*/,

  // MIR (Russia) - starts with 2200–2204
  [CardNetwork.MIR]: /^220[0-4]\d*/,

  // RuPay (India) - starts with 60 (excluding 6011), 6521, 6522
  [CardNetwork.RUPAY]: /^(60(?!11)|6521|6522)\d*/,
};
