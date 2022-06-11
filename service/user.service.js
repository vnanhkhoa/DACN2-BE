const UserRepository = require("../repositories/user.repository")

module.exports = {
    getBill: async (customerId) => {
        try {
            const bill = await UserRepository.getBill(customerId)
            return { success: true, bill }
        } catch (err) {
            return { success: false, message: "Interval server error" }
        }
    },
}