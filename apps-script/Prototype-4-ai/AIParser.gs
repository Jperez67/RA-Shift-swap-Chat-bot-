function parseAICommand(message) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY in Script Properties.');
  }

  const url = 'https://api.openai.com/v1/responses';

  const payload = {
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
       content:
  'You are an RA scheduling assistant. Convert the user message into structured JSON only. Dates should be returned in YYYY-MM-DD format when possible. If the year is missing, assume 2026. If the user asks who is on duty for one slot, use ask_shift. If the user asks who is on duty for a whole day, use ask_day_schedule. If required fields are missing, include them in missingFields.'
      },
      {
        role: 'user',
        content: message
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'ra_schedule_intent',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            intent: {
              type: 'string',
              enum: [
                  'ask_shift',
                  'ask_day_schedule',
                  'ask_weekend_schedule',
                  'request_swap',
                  'admin_resync',
                  'unknown'
              ]
            },
            shiftDate: {
              type: ['string', 'null']
            },
            shiftSlot: {
              type: ['string', 'null'],
              enum: ['Primary', 'Secondary', null]
            },
            originalRA: {
              type: ['string', 'null']
            },
            replacementRA: {
              type: ['string', 'null']
            },
            reason: {
              type: ['string', 'null']
            },
            confidence: {
              type: 'number'
            },
            missingFields: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          },
          required: [
            'intent',
            'shiftDate',
            'shiftSlot',
            'originalRA',
            'replacementRA',
            'reason',
            'confidence',
            'missingFields'
          ]
        }
      }
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error(`OpenAI API error ${status}: ${body}`);
  }

  const result = JSON.parse(body);

  Logger.log(body);

  let textOutput = result.output_text;

  if (!textOutput && result.output && result.output.length > 0) {
    const messageOutput = result.output.find(item => item.type === 'message');

    if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
      const textPart = messageOutput.content.find(part => part.type === 'output_text');

      if (textPart && textPart.text) {
        textOutput = textPart.text;
      }
    }
  }

  if (!textOutput) {
    throw new Error('Could not find output text in OpenAI response. Full response: ' + body);
  }

  return JSON.parse(textOutput);
}

function testAIParser() {
  const result = parseAICommand(
    'Can Alex take my primary shift on April 24, 2026 because I have class?'
  );

  Logger.log(JSON.stringify(result, null, 2));
}