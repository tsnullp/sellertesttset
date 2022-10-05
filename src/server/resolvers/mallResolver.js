const resolvers = {
  Query: {
    GetCoupangMallList: async (parent, {}, { req, model: {CoupangMall}, logger}) => {
      try {
        const list = await CoupangMall.aggregate([
          {
            $match: {
              isDelete: false,
              businessName: {
								$nin: ["널포인트", "미니투스", "메타트론(metatron)"]
							}
            }
          },
          { $sample: { size: 50 } },
          {
            $lookup: {
              from: "coupangmallfavorites",
        
              localField: "_id",
              foreignField: "mallID",
              as: "favorite"
            }
          },
        //	{
        //		$unwind: "$favorite"
        //	}
        ])
        return list.map(item => {
          return {
            _id: item._id,
            mallPcUrl: item.mallPcUrl,
            marketName: item.marketName,
            businessName: item.businessName,
            representativeName: item.representativeName,
            isFavorite: item.favorite.length > 0
          }
        })
      } catch(e){
        logger.error(`GetCoupangMallList: ${e}`)
        return []
      }
    },
    GetNaverMallList: async (parent, {}, { req, model: {NaverMall}, logger}) => {
      try {
        const list = await NaverMall.aggregate([
          {
            $match: {
              isDelete: {$ne: true},
              businessName: {
								$nin: ["NULL STORE", "미니투스", "메타트론"]
							}
            }
          },
          { $sample: { size: 50 } },
          {
            $lookup: {
              from: "navermallfavorite",
        
              localField: "_id",
              foreignField: "mallID",
              as: "favorite"
            }
          },
        //	{
        //		$unwind: "$favorite"
        //	}
        ])
        
        return list.map(item => {
          return {
            _id: item._id,
            mallPcUrl: item.mallPcUrl,
            marketName: item.mallName,
            businessName: item.businessName,
            representativeName: item.representativeName,
            isFavorite: item.favorite.length > 0
          }
        })
      } catch(e){
        logger.error(`GetCoupangMallList: ${e}`)
        return []
      }
    },
    GetCoupangMallFavoriteList: async (parent, {}, { req, model: {CoupangMallFavorite}, logger}) => {
      try {
        const list = await CoupangMallFavorite.aggregate([
          {
            $match: {
        			userID: req.user.adminUser
            }
          },
          {
            $lookup: {
              from: "coupangmalls",
              localField: "mallID",
              foreignField: "_id",
              as: "mall"
            }
          },
          {
            $unwind: "$mall"
          }
        ])
        return list.map(item => {
          return {
            _id: item.mall._id,
            mallPcUrl: item.mall.mallPcUrl,
            marketName: item.mall.marketName,
            businessName: item.mall.businessName,
            representativeName: item.mall.representativeName,
            isFavorite: true
          }
        })
      } catch(e){
        logger.error(`GetCoupangMallList: ${e}`)
        return []
      }
    },
    GetNaverMallFavoriteList: async (parent, {}, { req, model: {NaverMallFavorite}, logger}) => {
      try {
        const list = await NaverMallFavorite.aggregate([
          {
            $match: {
        			userID: req.user.adminUser
            }
          },
          {
            $lookup: {
              from: "navermalls",
              localField: "mallID",
              foreignField: "_id",
              as: "mall"
            }
          },
          {
            $unwind: "$mall"
          }
        ])
        return list.map(item => {
          return {
            _id: item.mall._id,
            mallPcUrl: item.mall.mallPcUrl,
            marketName: item.mall.mallName,
            businessName: item.mall.businessName,
            representativeName: item.mall.representativeName,
            isFavorite: true
          }
        })
      } catch(e){
        logger.error(`GetCoupangMallList: ${e}`)
        return []
      }
    }
  },
  Mutation: {
    SetCoupangFavorite: async (parent, {_id}, { req, model: {CoupangMallFavorite}, logger}) => {
      try {

        const favorite = await CoupangMallFavorite.findOne(
          {
            userID: req.user.adminUser,
            mallID: _id
          }
        )
        if(favorite){
          await CoupangMallFavorite.deleteOne(
            {
              userID: req.user.adminUser,
              mallID: _id
            }
          )
        } else {
          await CoupangMallFavorite.create(
            {
              userID: req.user.adminUser,
              mallID: _id
            }
          )
        }
        
        return true
      } catch(e){
        logger.error(`SetCouapngFavorite: ${e}`)
        return false
      }
    },
    SetNaverFavorite: async (parent, {_id}, { req, model: {NaverMallFavorite}, logger}) => {
      try {

        const favorite = await NaverMallFavorite.findOne(
          {
            userID: req.user.adminUser,
            mallID: _id
          }
        )
        if(favorite){
          await NaverMallFavorite.deleteOne(
            {
              userID: req.user.adminUser,
              mallID: _id
            }
          )
        } else {
          await NaverMallFavorite.create(
            {
              userID: req.user.adminUser,
              mallID: _id
            }
          )
        }
        
        return true
      } catch(e){
        logger.error(`SetCouapngFavorite: ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers