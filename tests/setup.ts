import nock from 'nock';
import { TextEncoder, TextDecoder } from 'util';
import { deleteDefaultConfig, setupDefaultConfig } from './common-helper';

Object.assign(global, {
  TextDecoder,
  TextEncoder,
  SDK_NAME: 'monocloud',
  SDK_VERSION: '1.0.0',
  SDK_DEBUGGER_NAME: 'monocloud',
});

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
