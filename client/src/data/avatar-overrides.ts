/**
 * AI caricature avatar overrides (ported from BOTHUB catalog).
 * Keyed by iBot `name` because the two source catalogs used different id schemes.
 * Rendered as <img> by <BotAvatar>; entries without an override fall back to the emoji avatar.
 *
 * Avatars hosted on Manus S3 CDN.
 */
export const AVATAR_OVERRIDES: Record<string, string> = {
  "Alex Hormozi": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/gotjGUbclIjTyKHh.png",
  "Grant Cardone": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/QKyHoogAOVefXgTw.png",
  "Russell Brunson": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/aaZisRMxvxyfjHuv.png",
  "Gary Vaynerchuk": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/qvUAJPdmjQmEdyph.png",
  "Carl Jung": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/AcAGoyaQTprRxBkQ.png",
  "Viktor Frankl": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/RpQfnKXkDsZOYAck.png",
  "Elon Musk": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/wBYDIwVpbWgtDYKO.png",
  "Steve Jobs": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/UrQkDvLvnutTBkOP.png",
  "Warren Buffett": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/ifrvvwAQVecfQfsJ.png",
  "Robert Kiyosaki": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/XmEOTmxSZCOATGTd.png",
  "Dalai Lama": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/gPpgMddLvJfXnIxW.png",
  "Eckhart Tolle": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/ZMoKHNxnctdKVokk.png",
  "Andrew Huberman": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/bGDrgvIzDutoRBxE.png",
  "Peter Attia": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/seSluCayxGYIxczg.png",
  "David Goggins": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/AhciEZJrFeLpMaPV.png",
  "Tim Ferriss": "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/WkCtjoikTnOdlilq.png",
};

export function getAvatarUrl(name: string): string | undefined {
  return AVATAR_OVERRIDES[name];
}
