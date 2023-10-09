import { CamelCaseToTitlePipe } from './camel-case-to-title.pipe';

describe('CamelCaseToTitlePipe', () => {
  it('create an instance', () => {
    const pipe = new CamelCaseToTitlePipe();
    expect(pipe).toBeTruthy();
  });
});
