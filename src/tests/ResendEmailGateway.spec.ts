import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.RESEND_API_KEY = 're_teste';
  process.env.RESEND_FROM = 'Luz da Esperança <contato@dominio.com>';
});

const sendMock = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { ResendEmailGateway } from '@/src/features/emails/infrastructure/email/ResendEmailGateway';

describe('ResendEmailGateway', () => {
  it('envia usando o from do ambiente e retorna ok', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null });

    const gateway = new ResendEmailGateway();
    const result = await gateway.send({ para: 'a@b.com', assunto: 'Oi', corpoHtml: '<p>oi</p>' });

    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'Luz da Esperança <contato@dominio.com>', to: ['a@b.com'] }),
    );
  });

  it('retorna falha quando o Resend retorna erro', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const gateway = new ResendEmailGateway();
    const result = await gateway.send({ para: 'a@b.com', assunto: 'Oi', corpoHtml: '<p>oi</p>' });

    expect(result.ok).toBe(false);
  });
});
