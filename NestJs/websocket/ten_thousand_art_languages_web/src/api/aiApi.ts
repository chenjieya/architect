import http from '@/utils/request'
export async function chatAi(params: { question: string }) {
  return await http.post('/api/ai/ask', params, { showError: true, responseType: 'stream' })
}
