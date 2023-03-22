# GH-Repo-Explorer

GH-Repo-Explorer is a web application that allows you to search and explore Github repositories. This project is built using the Remix framework, a fullstack framework based on react-router. The UI is styled with Tailwind CSS and it is fully keyboard accessible.

## Getting Started

### Prerequisites

To run this project locally, you will need to have Node.js installed on your machine. If you don't have it installed, you can download it from https://nodejs.org.

### Installation

Clone the repository to your local machine.

```
git clone https://github.com/firzx77/gh-repo-explorer.git
```

Create a `.env` file at the root of the project with your GH_TOKEN.

```
GH_TOKEN=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
```

You can use the provided token or generate your own Github personal access token with the repo scope.

Install the dependencies.

```
npm install
```

Start the development server.

```
npm run dev
```

The application should now be running at http://localhost:8787.

### Testing

To run the tests, run the following command:

```
npm run test
```

### Deployment

This project has been deployed to Cloudflare Workers and it is accessible at https://gh-repo-explorer.farizzx77.workers.dev/.

### Usage

Once you have the application running, you can use it to search and explore Github repositories. The UI is very user-friendly and allows you to enter a Github username and see all of their repositories. By default, the application will display the first 5 repositories.

To improve the performance, the application limits the number of repositories displayed to 5 per page. If you want to see more repositories, you can click on the "Load more" button at the bottom of the page.

### Acknowledgements

- Remix framework: [https://remix.run/](https://remix.run/)
- Tailwind CSS: [https://tailwindcss.com/](https://tailwindcss.com/)
- Github API: [https://docs.github.com/en/rest](https://docs.github.com/en/rest)
- Illustration: [https://undraw.co/](https://undraw.co/)
- Icons: [https://heroicons.com/](https://heroicons.com/) and [https://iconify.design/](https://iconify.design/)
