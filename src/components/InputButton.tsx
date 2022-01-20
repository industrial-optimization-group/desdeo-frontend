import React, { useEffect } from "react";

import { useForm } from "react-hook-form";
import {
    Form,
    Button,
} from "react-bootstrap";

interface FormData {
    values: number;
}

interface InputButtonProps {
    stepNumber: number;
    disabled: boolean;
    handleChange: | React.Dispatch<React.SetStateAction<number>>
    | ((x: number) => void);
}

function InputButton({
    stepNumber,
    disabled,
    handleChange,
}: InputButtonProps) {
    const {
        register,
        formState: { errors },
        handleSubmit,
        reset,
    } = useForm<FormData>({
        mode: "onBlur",
    });
    // not sure if this needed
    useEffect(() => {
        reset();
    }, [stepNumber]);

    const onSubmit = (data: FormData) => {
        handleChange(data.values);
        //handleChange(stepNumber);
    };


    return (
        <Form action="" onSubmit={handleSubmit(onSubmit)} data-testid="inputbutton">
            <Form.Group>
                <Form.Control
                    key={`controlof${stepNumber}`}
                    name={`values`}
                    defaultValue={stepNumber}
                    ref={register({
                        required: true,
                        pattern: {
                            value: /[+-]?([0-9]*[.])?[0-9]+/,
                            message: "Input not recognized as float.",
                        },
                        valueAsNumber: true,
                        validate: {
                            isFloat: (v) =>
                                !Number.isNaN(parseFloat(v)) ||
                                "Input must be float",
                        },
                        min: 1,
                        max: 100
                    },
                    )}
                />
            </Form.Group>
            <Button disabled={disabled} type="submit">Set</Button>
        </Form >
    );
}

export default InputButton;
