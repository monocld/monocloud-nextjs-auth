import nock from 'nock';
import { deleteDefaultConfig, setupDefaultConfig } from './common-helper';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  setupDefaultConfig();
});

afterEach(() => {
  nock.cleanAll();
  deleteDefaultConfig();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.resetModules();
});
