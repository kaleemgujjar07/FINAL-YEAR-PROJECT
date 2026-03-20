exports.sanitizeUser=(user)=>{
    if (!user) return null;
    return {_id:user._id,email:user.email,isVerified:user.isVerified,isAdmin:user.isAdmin}
}