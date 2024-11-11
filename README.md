# Manual Google OAuth

## Overview

This repository cotains the code for a simple backend web application that showcases how to implement Google OAuth **without using any third-party library**. This can help with understanding how the libraries work behind the scenes, and also help to better understand how Google OAuth works in general.

## Live Demo

<!-- Check out a live demo of the application [here](https://manual-google-oauth.onrender.com). -->

Due to Google Web Risk protocols, the deployed version of the application has been brought down. To test the application, you can consider [running it locally](#running-the-application-locally)

## Techologies Used

- **Node.js**

- **Typescript** (not required)

- **EJS**

## Running the Application Locally

### Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Make sure you have Node.js installed on your machine.
- **Google OAuth Credentials**: Create a project in the [Google Cloud Console](https://console.cloud.google.com), enable the Google OAuth API, and obtain your client ID and client secret. These credentials should be added to your `.env` file for proper configuration.

### Installation

1. Clone the repository

```bash
git clone https://github.com/chideraemmanuel/manual-google-oauth.git
```

2. Install dependencies

```bash
npm install
```

### Configuration

#### Environment variables

To configure the environment variables, please refer to the `.env.example` file located in the root of the project. This file contains all the necessary environment variables you need to set up. Simply create a `.env` file based on the example and update the values as required for your environment.

### Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Access the application: Open your web browser and go to [http://localhost:5000](http://localhost:3000) to view the application.
