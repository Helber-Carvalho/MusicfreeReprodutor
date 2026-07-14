import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Home from '../src/app/index';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Home />);
  });
});
