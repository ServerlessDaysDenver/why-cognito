import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify, } from 'aws-amplify';
import { fetchAuthSession} from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import outputs from "../env.json";

Amplify.configure({
        Auth: {
            Cognito: {
               userPoolId: outputs.userPoolId,
               userPoolClientId: outputs.userPoolClientId,
               userAttributes: {
                   family_name: {
                       required: true,
                   },
                   given_name: {
                       required: true,
                   },
                   email: {
                       required: true,
                   },
               }
            }
        }
    });


// https://docs.amplify.aws/react/build-a-backend/auth/connect-your-frontend/using-the-authenticator/
export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

