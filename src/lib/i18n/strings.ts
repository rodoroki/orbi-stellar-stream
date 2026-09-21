/** Internationalization-ready string table. Default locale: pt-BR. */

export const strings = {
  "app.name": "ORBI BROADCAST CONTROL",
  "app.tagline": "Estação de controle audiovisual",
  "nav.catalog": "CATÁLOGO",
  "nav.program": "PROGRAMAÇÃO",
  "nav.broadcast": "TRANSMISSÃO",
  "nav.history": "HISTÓRICO",
  "nav.settings": "CONFIGURAÇÕES",
  "status.broadcast": "TRANSMISSÃO",
  "status.youtube": "YOUTUBE",
  "status.encoder": "ENCODER",
  "action.preview": "Pré-visualizar",
  "action.details": "Detalhes",
  "action.addToProgram": "Adicionar à programação",
  "action.clearProgram": "Limpar programação",
  "action.saveProgram": "Salvar programação",
  "action.previewProgram": "Visualizar programação",
  "action.connectYoutube": "Conectar YouTube",
  "action.startBroadcast": "Iniciar transmissão",
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey): string {
  return strings[key];
}
