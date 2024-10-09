import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.static('public'));

app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(morgan('dev'));

app.get('/', async (request: express.Request, response: express.Response) => {
  // !!! BUILDING THE AUTH URI !!!
  const base_auth_uri = 'https://accounts.google.com/o/oauth2/v2/auth';

  // ! building the query parameters
  /**
   * The fields in this object are required, but there can be additional options for extra configuration.
   * Learn more about those in the google OAuth documentation (https://developers.google.com/identity/protocols/oauth2/web-server).
   */
  const options = {
    response_type: 'code',
    /**
     *  The client ID should be gotten from the Google cloud console (https://console.cloud.google.com/).
     */
    client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,

    /**
     * The redirect uri is where Google will redirect to after the authentication, that is after the user agrees or disagrees to give your application access to their account information.
     * If user agrees, a query parameter of `code` will be added while redirecting to the specified uri. You can choose to handle this however you wish i.e on either the fontend or backend.
     * The code will be used to gain access to the user's info.
     * Whatever redirect uri is added here MUST be configured on the Google cloud console, otherwise, this won't work.
     * Query parameters can be added to the redirect uri, but it MUST be configured on the Google cloud console.
     * In this example, we're redirecting to another endpoint in our application, which will handle the authentication.
     */
    redirect_uri: `${process.env.API_BASE_URL}/login/google`,

    /**
     * The scopes of information and/or access your application requires. Learn more about this in the google OAuth documentation (https://developers.google.com/identity/protocols/oauth2/web-server).
     */
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    access_type: 'offline',
  };

  const queryStrings = new URLSearchParams(options);

  const full_auth_uri = `${base_auth_uri}?${queryStrings.toString()}`;

  console.log('full_auth_uri', full_auth_uri);

  // ? Now that we have the full auth uri, we can send it to the client that wants to request authentication.
  // ? In this simple demo, we're just sending it to a page to be rendered on our server, but this could be any sort of frontend.
  return response.render('index', { full_auth_uri });
});

interface GoogleResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string; // same scope that was used to generate the authentication uri
  token_type: 'Bearer';
  id_token: string;
}

interface GoogleUserData {
  iss: 'https://accounts.google.com';
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

app.get(
  '/login/google',
  async (request: express.Request, response: express.Response) => {
    // the `code` will be sent to this endpoint by Google only if the user gives out application permission
    const { code } = request.query;

    if (!code) {
      return response.redirect('/'); // todo: handle error properly
    }

    const base_token_uri = 'https://oauth2.googleapis.com/token';

    const options = {
      code,
      /**
       *  The same client ID that was used when creating the authentication uri. It should be gotten from the Google cloud console (https://console.cloud.google.com/).
       */
      client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,

      /**
       *  The client secret should be gotten from the Google cloud console (https://console.cloud.google.com/), and MUST be private.
       */
      client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,

      /**
       * This must match the redirect_uri specified when creating the authentication uri, and also configured on the Google cloud console.
       */
      redirect_uri: `${process.env.API_BASE_URL}/login/google`,

      grant_type: 'authorization_code',
    };

    try {
      const res = await fetch(base_token_uri, {
        method: 'POST',
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        return response.redirect('/'); // todo: handle error properly
      }

      // Now that we have the user's profile info, we can use it in our application.
      // Typically, this is where you'd create a new user record in you database (and a session, if you're using session based authentication, or a JWT), and then send some sort of session identifier to the client (either the session id as cookie, or the JWT as JSON or even cookie, depending on how your application is set up).
      const google_response: GoogleResponse = await res.json();

      // @ts-ignore
      const user_data: GoogleUserData = jwt.decode(google_response.id_token);

      console.log('user data', user_data);

      // In this simple demo, we're just redirecting to an endpoint (a dummy dashboard) in our application, with some information sent as cookie.
      return response
        .cookie('is_authenticated', true)
        .cookie('email', user_data.email)
        .cookie('name', user_data.name)
        .cookie('picture', user_data.picture)
        .redirect('/dashboard');
    } catch (error: any) {
      console.log('[GOOGLE_OAUTH_ERROR]', error);
      response.redirect('/'); // todo: handle error properly
    }
  }
);

app.get(
  '/dashboard',
  async (request: express.Request, response: express.Response) => {
    const cookies = request.cookies;

    console.log('cookies', cookies);

    const { is_authenticated, email, name, picture } = cookies;

    if (!is_authenticated) {
      return response.redirect('/');
    }

    return response.render('dashboard', {
      email,
      name,
      picture,
    });
    // response.send('dashboard');
  }
);

app.get(
  '/logout',
  async (request: express.Request, response: express.Response) => {
    return response
      .cookie('is_authenticated', '', { maxAge: 0 })
      .cookie('email', '', { maxAge: 0 })
      .cookie('name', '', { maxAge: 0 })
      .cookie('picture', '', { maxAge: 0 })
      .redirect('/');
  }
);

app.use(
  (
    error: any,
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    response.status(error.status || 500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server started and is listening on http://localhost:${PORT}`);
});
