const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,13}$/;

function hasConsecutiveSpaces(str) {
    return /\s{2,}/.test(str);
}

function validateUser(user, existingUsers = []) {
    const errors = [];

    if (!user || Object.keys(user).length === 0) {
        errors.push('No data was received');
        return errors;
    }

    // Validar nombre
    if (!user.name) {
        errors.push('The field "name" is required');
    } else {
        if (!nameRegex.test(user.name)) {
            errors.push('The field "name" must contain only letters and spaces, and be 3 to 13 characters long');
        }
        if (hasConsecutiveSpaces(user.name)) {
            errors.push('The field "name" must not contain consecutive spaces');
        }
    }

    // Validar email
    if (!user.email || !emailRegex.test(user.email)) {
        errors.push('The field "email" does not have the structure of an email');
    } else if (user.email.length > 50) {
        errors.push('The field "email" must not exceed 50 characters');
    }

    // Validar ID
    if (user.id != null) {
        if (!Number.isInteger(user.id) || user.id <= 0) {
            errors.push('The field "id" must be a positive integer');
        } else {
            const idTaken = existingUsers.some(u => u.id === user.id);
            if (idTaken) {
                errors.push(`User with ID ${user.id} already exists`);
            }
        }
    }

    return errors;
}

function validateUserUpdate(user) {
    const errors = [];

    // Validar nombre si se incluye
    if (user.name) {
        if (!nameRegex.test(user.name)) {
            errors.push('The field "name" must contain only letters and spaces, and be 3 to 13 characters long');
        }
        if (hasConsecutiveSpaces(user.name)) {
            errors.push('The field "name" must not contain consecutive spaces');
        }
    }

    // Validar email si se incluye
    if (user.email) {
        if (!emailRegex.test(user.email)) {
            errors.push('The field "email" does not have the structure of an email');
        } else if (user.email.length > 50) {
            errors.push('The field "email" must not exceed 50 characters');
        }
    }

    // Validar ID si se quiere cambiar
    if (user.id != null && (!Number.isInteger(user.id) || user.id <= 0)) {
        errors.push('The field "id" must be a positive integer');
    }

    return errors;
}

function validateUpdatedId(newId, currentId, users) {
    if (newId && newId !== currentId) {
        const idUsed = users.find(user => user.id === newId);
        return idUsed ? `ID ${newId} is already used by another user` : null;
    }
    return null;
}

module.exports = {
    validateUser,
    validateUserUpdate,
    validateUpdatedId
};
