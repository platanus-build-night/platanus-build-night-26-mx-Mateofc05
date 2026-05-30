# Registrar a un atleta de fútbol en LineUp — instrucciones para Claude Code

Estás ayudando a un atleta de fútbol hispanohablante a registrarse en **LineUp**,
una plataforma que lo conecta con programas de fútbol universitario de EE. UU. Tu
tarea es recopilar su perfil y enviarlo con **una sola llamada directa a la API**.
Después de eso, su perfil aparece en el panel de la agencia para hacer match con
programas.

> El atleta te pasó el enlace a este documento. La API de LineUp vive en
> **`https://lineup-platanus.vercel.app`**. Usa esa base para cada endpoint de
> abajo (ya está escrita en los ejemplos).

---

## Paso 1 — (opcional) Ver qué posiciones tienen demanda

`GET https://lineup-platanus.vercel.app/api/agent/list-positions`

Devuelve las posiciones válidas y cuántos programas de EE. UU. necesitan cada una.

## Paso 2 — (opcional) Revisar elegibilidad antes de enviar

`POST https://lineup-platanus.vercel.app/api/agent/check-eligibility` con `Content-Type: application/json`

```json
{
  "gpaEquivalent": 3.4,
  "gradYear": 2027,
  "englishTestType": "TOEFL",
  "englishTestScore": 82,
  "isMinor": true,
  "parentalConsent": true
}
```

Devuelve una evaluación de preparación (académico, inglés, ventana de egreso,
consentimiento de menor). Solo lectura — no guarda nada.

## Paso 3 — Enviar el perfil (la llamada obligatoria)

`POST https://lineup-platanus.vercel.app/api/agent/submit-profile` con `Content-Type: application/json`

### Campos

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `fullName` | string | ✅ | Nombre completo del atleta |
| `country` | string | ✅ | País de origen, p. ej. "México" |
| `position` | string | ✅ | Texto libre: "extremo", "delantero", "9", "portero" — se normaliza automáticamente |
| `gradYear` | integer | ✅ | Año de egreso de preparatoria (2024–2032) |
| `heightCm` | integer | – | Estatura en centímetros |
| `dominantFoot` | string | – | "Right" \| "Left" \| "Both" |
| `gpaEquivalent` | number | – | GPA en escala de 0 a 4 |
| `englishTestType` | string | – | "TOEFL" \| "IELTS" \| "Duolingo" |
| `englishTestScore` | number | – | Puntaje de ese examen |
| `goals` | integer | – | Goles en la temporada |
| `assists` | integer | – | Asistencias en la temporada |
| `matches` | integer | – | Partidos jugados |
| `passAccuracy` | integer | – | % de pases completados, 0–100 |
| `videoUrl` | string | – | Enlace de video de jugadas |
| `isMinor` | boolean | – | `true` si es menor de 18 |
| `parentalConsent` | boolean | – | `true` si un padre/madre o tutor autoriza |

### Ejemplo

```bash
curl -X POST https://lineup-platanus.vercel.app/api/agent/submit-profile \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Mateo García",
    "country": "México",
    "position": "extremo derecho",
    "gradYear": 2027,
    "heightCm": 178,
    "dominantFoot": "Right",
    "gpaEquivalent": 3.5,
    "englishTestType": "TOEFL",
    "englishTestScore": 82,
    "goals": 18,
    "assists": 9,
    "matches": 27,
    "passAccuracy": 84,
    "videoUrl": "https://youtu.be/example",
    "isMinor": true,
    "parentalConsent": true
  }'
```

### Respuesta de éxito

```json
{
  "ok": true,
  "athleteId": "athlete-mateo-garcia-...",
  "profileUrl": "/athletes/athlete-mateo-garcia-...",
  "message": "El perfil de Mateo García fue agregado al panel de la agencia. ..."
}
```

Comparte el `profileUrl` (con el prefijo `https://lineup-platanus.vercel.app`) con el atleta para que vea su
perfil. Ante un error de validación recibirás HTTP `422` con un objeto `errors`
que lista los campos faltantes/inválidos — corrígelos y reintenta.

---

## Cómo trabajar con el atleta

1. Pide primero los campos **obligatorios** (nombre, país, posición, año de
   egreso) y luego recopila tantos campos opcionales como pueda darte. Puede
   responder en español o inglés — refleja su idioma.
2. Si comparte un CV, captura de perfil o una página tipo transfermarkt, léela y
   llena los campos tú mismo.
3. Si es **menor de 18**, DEBES preguntar si un padre/madre o tutor autoriza y
   establecer `isMinor`/`parentalConsent` según corresponda.
4. Haz la única llamada `submit-profile` y confirma el éxito.

## Importante — sé honesto con las expectativas

- Nunca prometas admisión, becas ni elegibilidad NCAA. El **estatus final del
  NCAA Eligibility Center siempre es una revisión manual**.
- Todo contacto con entrenadores es **revisado y aprobado por una agencia humana**
  antes de enviarse. Para menores, no se contacta a los entrenadores hasta que se
  registre el consentimiento parental.
