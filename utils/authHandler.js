let jwt = require('jsonwebtoken')
let userController = require("../controllers/users");

function normalizeRole(name) {
    if (!name || typeof name !== 'string') return '';
    return name.trim().toLowerCase();
}

module.exports = {
    checkLogin: function (req, res, next) {
        try {
            let token;
            if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } else {
                let authorizationToken = req.headers.authorization;
                if (!authorizationToken || !authorizationToken.startsWith('Bearer ')) {
                    res.status(403).send({
                        message: "ban chua dang nhap"
                    });
                    return;
                }
                token = authorizationToken.split(' ')[1];
            }
            if (!token) {
                res.status(403).send({
                    message: "ban chua dang nhap"
                });
                return;
            }
            let result = jwt.verify(token, 'HUTECH');
            if (result.exp > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send({
                    message: "ban chua dang nhap"
                });
            }
        } catch (error) {
            res.status(403).send({
                message: "ban chua dang nhap"
            });
        }
    },
    /** So khớp không phân biệt hoa thường; hỗ trợ alias: ADMIN->admin, MODERATOR/MOD->mod */
    checkRole: function (...requiredRoles) {
        let normalizedRequired = requiredRoles.map(normalizeRole);
        return async function (req, res, next) {
            try {
                let getUser = await userController.FindByID(req.userId);
                if (!getUser || !getUser.role) {
                    res.status(403).send({
                        message: "ban khong co quyen"
                    });
                    return;
                }
                let roleName = normalizeRole(getUser.role.name);
                let aliases = {
                    admin: 'admin',
                    mod: 'mod',
                    moderator: 'mod'
                };
                let userEffective = aliases[roleName] || roleName;
                let allowed = normalizedRequired.some(function (reqRole) {
                    let need = aliases[reqRole] || reqRole;
                    return userEffective === need;
                });
                if (allowed) {
                    next();
                } else {
                    res.status(403).send({
                        message: "ban khong co quyen"
                    });
                }
            } catch (e) {
                res.status(403).send({
                    message: "ban khong co quyen"
                });
            }
        };
    }
};