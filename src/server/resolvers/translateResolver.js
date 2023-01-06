const {papagoTranslate, cnTranslate} = require("../puppeteer/translate")

const resolvers = {
  Query: {
    TranslatePapago: async (parent, {text}, { logger }) => {
      
      try {
        if(!text || text.length === 0){
          return null
        }
        // const criteria = 20
        // let dimensionArray2 = []
        // dimensionArray2 = text.reduce((array, number, index) => {
        //   const arrayIndex = Math.floor(index / criteria)
        //   if (!array[arrayIndex]) {
        //     array[arrayIndex] = []
        //   }
        //   array[arrayIndex] = [...array[arrayIndex], number]
        //   return array
        // }, [])

        // const returnValue = []
        
        // for(const item of dimensionArray2){
        //   returnValue.push(...await papagoTranslateArray(item))
        // }
        // return returnValue
        // return await papagoTranslateArray(text)
       
        const response = await papagoTranslate(text)
        
        return response
      } catch (e) {
        logger.error(`TranslatePapago: ${e}`)
        return text
      }
    }
  },
  Mutation: {
    KorToCn: async (parent, {text}, { logger }) => {
      try {
        return await cnTranslate(text)
      } catch(e) {
        logger.error(`KorToCn: ${e}`)
        return text
      }
    }
  }
}

module.exports = resolvers