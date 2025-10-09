import { Request, Response } from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";


export const registerUser = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, age, gender } = req.body;
    try {
        const findUser = await User.findOne({ email });
        if (findUser) {
            res.status(400).send('User already exists');
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstName, lastName, email, password: hashedPassword, age, gender });
        await user.save();
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
        return;
    }


    res.status(201).send('User registered');
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).send('Invalid email or password');
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send('Invalid email or password');
            return;
        }
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal Server Error');
    }
}