var express = require("express");
let userModel = require("../schemas/users");
module.exports = {
    CreateAnUser: async function (username, password,
        email, role, fullName, avatarUrl, status
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status

        });
        await newItem.save();
        return newItem;
    },
    FindByID: async function (id) {
        return await userModel
            .findOne({
                _id: id,
                isDeleted: false
            }).populate({
                path: 'role', select: 'name'
            });
    },
    FindByUsername: async function (username) {
        return await userModel.findOne(
            {
                username: username,
                isDeleted: false
            }
        )
    }, FindByEmail: async function (email) {
        return await userModel.findOne(
            {
                email: email,
                isDeleted: false
            }
        )
    },
    FindByToken: async function (token) {
        let user = await userModel.findOne(
            {
                forgotPasswordToken: token,
                isDeleted: false
            }
        )
        if (user && user.forgotPasswordTokenExp > Date.now()) {
            return user;
        }
        return undefined
    },
    getAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false }).
            populate({ path: 'role', select: 'name' })
        return users;
    },
    UpdateUser: async function (id, body) {
        let updatedItem = await userModel.findOne({ _id: id, isDeleted: false });
        if (!updatedItem) {
            return null;
        }
        let keys = Object.keys(body);
        for (const key of keys) {
            updatedItem[key] = body[key];
        }
        await updatedItem.save();
        return await userModel.findById(updatedItem._id).populate({
            path: 'role',
            select: 'name'
        });
    },
    SoftDeleteUser: async function (id) {
        return await userModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
    }
}