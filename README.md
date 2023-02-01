# event-portal-scan-data-diff

A prototype of what event portal configuration audit could be like.

![screenshot of diff](https://github.com/SolaceDev/maas-ep-config-audit-proto/blob/main/img/diffscreenshot.png?raw=true)

## Dependencies

You need your very own MySQL instance running.

You need a SOLACE CLOUD TOKEN capable of reading environments, event meshes, messaging services and scan data.

Create a .env file with the following information:
```
DATABASE_URL="mysql://myuser:mypassword@localhost:3308/my_database"
SOLACE_CLOUD_TOKEN="eyabcdefg123bedfa"
SOLACE_URL="https://api.solace.cloud"
```

## How to run

clone this repo
```
npm install
npx prisma generate 
npx prisma db push
npm run dev
```

Navigate to http://localhost:3000 (or whatever port it starts the server on. It will tell you)

## How to use
* Click the advanced link on the first page.
* Click "Resync with Event Portal"
* Navigate back to the first page.
* Select a Environment, Event Mesh and Messaging Service
* Click on the checkboxes beside 2 of the scans (order matters here, do the later one first - yah, I know, it's just a prototype though)
* Click the `Diff` button that just appeared.

You should then be taken to the diff results page.

## Resources
This is not an officially supported Solace product.

For more information try these resources:
- Ask the [Solace Community](https://solace.community)
- The Solace Developer Portal website at: https://solace.dev


## Contributing
Contributions are encouraged! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors
See the list of [contributors](https://github.com/solacecommunity/<github-repo>/graphs/contributors) who participated in this project.

## License
See the [LICENSE](LICENSE) file for details.
