const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

console.log('NODE_ENV:', process.env.NODE_ENV);

const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

signupUserModel = async (name, email, password, loginMethod) => {
    // Wenn die loginMethod github ist, schreibe den Benutzer in die githubUser Tabelle
    const isGithubUser = loginMethod === 'github';

    if (isGithubUser) {
        const existingUser = await prisma.userGithub.findFirst({
            where: {
                OR: [{name: name}, {email: email}],
            },
        });
        if (existingUser) {
            return {
                data: {
                    name: existingUser.name,
                    email: existingUser.email,
                    loginMethod: 'github',
                },
            };
        } else {
            // Hashe das Passwort, bevor es in der Datenbank gespeichert wird
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            return prisma.userGithub.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
        }
    }

    const existingUser = await prisma.userLocal.findFirst({
        where: {
            OR: [{name: name}, {email: email}],
        },
    });
    if (existingUser) {
        return null;
    }

    // Hashe das Passwort, bevor es in der Datenbank gespeichert wird
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return prisma.userLocal.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
};

loginUserModel = async (email, password) => {
    // console.log('[loginUserModel] function called');
    const user = await prisma.UserLocal.findFirst({
        where: {email: email},
    });
    console.log(
        '[loginUserModel] user after prisma.UserLocal.findFirst: ',
        user
    );
    if (!user) {
        return null;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log(
        '[loginUserModel] isPasswordValid after bcrypt.compareSync: ',
        isPasswordValid
    );
    if (!isPasswordValid) {
        return null;
    }

    return {user};
};

module.exports = {loginUserModel, signupUserModel};
