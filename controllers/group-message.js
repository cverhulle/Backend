const GroupMessage = require('../models/group')
const path = require('path')

exports.createGroup = (req,res,next) => {
    const {
        groupName,
        groupDescription,
        groupType,
        groupLanguages,
        groupCategories,
        groupPassword
    } = req.body

}