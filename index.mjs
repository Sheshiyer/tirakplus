import { streamText } from 'ai'

const result = streamText({
  model: 'google/gemini-2.0-flash',
  prompt: 'Explain quantum computing in simple terms.',
})

for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
}
