import { render, screen, cleanup } from '@testing-library/react';
import renderer from 'react-test-renderer';

import InputButton from '../InputButton';


// simple tests to test rendering, property values and functions
test('should render InputButton', () => {
    render(<InputButton
        stepNumber={1}
        handleChange={() => { }} />);
    const inputele = screen.getByTestId('inputbutton');
    expect(inputele).toBeInTheDocument();
    //expect(inputele).toHaveProperty('stepNumber')
})



// test snapshots. Remember if changing stuff e.g props, snapshot will not be the same,
// hence test will fail even though should not. Update snapshot then.
test('matches snapshot', () => {
    const tree = renderer.create(<InputButton
        stepNumber={1}
        handleChange={() => { }} />).toJSON();

    expect(tree).toMatchSnapshot();
})



