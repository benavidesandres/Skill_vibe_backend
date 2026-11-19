import { ConfigService } from '@nestjs/config';
import { SimulatedVideoRoomProvider } from './simulated-video-room.provider';

// ConfigService falso: devuelve el valor que se le pase como VIDEO_BASE_URL
function crearProvider(baseUrl?: string): SimulatedVideoRoomProvider {
  const config = { get: jest.fn().mockReturnValue(baseUrl) };
  const provider = new SimulatedVideoRoomProvider(
    config as unknown as ConfigService,
  );
  // Evita que el log ensucie la salida de los tests
  jest.spyOn(provider['logger'], 'log').mockImplementation(() => undefined);
  return provider;
}

describe('SimulatedVideoRoomProvider', () => {
  const sessionId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('arma el link con la URL base y un UUID sin guiones', () => {
    const link = crearProvider('https://clases.skillvibe.test')
      .generateMeetingLink(sessionId);

    expect(link).toMatch(
      /^https:\/\/clases\.skillvibe\.test\/sala\.html\?room=[0-9a-f]{32}$/,
    );
  });

  it('usa http://localhost:5173 si VIDEO_BASE_URL no está definida', () => {
    const link = crearProvider(undefined).generateMeetingLink(sessionId);

    expect(link.startsWith('http://localhost:5173/sala.html?room=')).toBe(true);
  });

  it('da un link distinto en cada llamada', () => {
    const provider = crearProvider('http://localhost:3000');

    const primero = provider.generateMeetingLink(sessionId);
    const segundo = provider.generateMeetingLink(sessionId);

    expect(primero).not.toBe(segundo);
  });

  it('quita la barra final de la URL base', () => {
    const link = crearProvider('http://localhost:3000/')
      .generateMeetingLink(sessionId);

    expect(link).toMatch(/^http:\/\/localhost:3000\/sala\.html\?room=/);
    expect(link).not.toContain('3000//');
  });

  it('no escribe el id de la sesión dentro del link', () => {
    const link = crearProvider('http://localhost:3000')
      .generateMeetingLink(sessionId);

    expect(link).not.toContain(sessionId);
    expect(link).not.toContain(sessionId.replace(/-/g, ''));
  });
});
