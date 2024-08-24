import nock from 'nock';
import { TextEncoder, TextDecoder } from 'util';
import { deleteDefaultConfig, setupDefaultConfig } from './common-helper';

Object.assign(global, { TextDecoder, TextEncoder });

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  setupDefaultConfig();
});

afterEach(() => {
  nock.cleanAll();
  deleteDefaultConfig();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.resetModules();
});
