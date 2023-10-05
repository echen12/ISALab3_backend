const http = require('http');
const port = 3000; // Change to the desired port
const url = require('url');
const querystring = require('querystring');



const dictionary = [];

let numRequests = 0

function DictionaryEntry(word, def) {
    this.word = word;
    this.def = def;
}


const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === "/api/definitions/") {


        let urlQueryParams = url.searchParams.get("word")


        console.log(dictionary.find(d => d.word === urlQueryParams))
        if (dictionary.find(d => d.word === urlQueryParams) !== undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ message: dictionary.find(d => d.word === urlQueryParams), numberOfReq: ++numRequests }));
        } else if (urlQueryParams === null || dictionary.find(d => d.word === urlQueryParams) === undefined) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ errorMessage: 'Not Found', numberOfReq: ++numRequests }));
        }

    } else if (req.method === 'POST' && url.pathname === "/api/definitions") {

        let data = '';

        req.on('data', (chunk) => {
            data += chunk.toString();
        });

        req.on('end', () => {
            data = data.replace('?', '');
            const queryParams = querystring.parse(data)

            if (queryParams.word === undefined || queryParams.definition === undefined || (dictionary.find(d => d.word === queryParams.word) !== undefined && dictionary.find(d => d.def === queryParams.definition) !== undefined)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(JSON.stringify({ errorMessage: 'Invalid request body, both the word and definition must be provided or the word already exists.', numberOfReq: ++numRequests }));
            }
            else if (queryParams.word && queryParams.definition) {
                const newEntry = new DictionaryEntry(queryParams.word, queryParams.definition)

                if (!dictionary.some(el => el.word === queryParams.word)) {
                    dictionary.push(newEntry)
                } else {
                    let dictIndex = dictionary.findIndex(e => e.word === queryParams.word);
                    dictionary[dictIndex].def = queryParams.definition
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(JSON.stringify({ message: 'POST request received', data: dictionary, numberOfReq: ++numRequests }));
            }
        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.statusCode = 404;
        res.end(JSON.stringify({ errorMessage: 'Invalid request', numberOfReq: ++numRequests }));
    }
});


server.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}`);
});