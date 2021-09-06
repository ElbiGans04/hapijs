import fs from 'fs';

const modules = [];

fs.readdirSync(__dirname).forEach((folderOrFile) => {
    if (folderOrFile !== 'index.js') {
        let apiModule = require(`./${folderOrFile}`);
        if (apiModule.default) {
            apiModule = apiModule.default
        }

        console.log(apiModule)
        modules.push(apiModule)
    }
})

export default modules