import { useEffect, useState } from "react";
import { fetchAuthSession} from 'aws-amplify/auth';
import outputs from "../env.json";
import {S3Client, ListObjectsCommand} from "@aws-sdk/client-s3";
import {fromCognitoIdentityPool} from "@aws-sdk/credential-providers";


const BASE_URL = outputs.apiUrl;

interface Todo {
  id: number;
  task: string;
  tenantId: string;
}

export default function Dummy({}) {
    const [todo, setTodo] = useState<Todo>({
        id: 0,
        task: '',
        tenantId: ''
    });
    useEffect(() => {
        async function FetchTodo() {
            const session = await fetchAuthSession();
            const REGION = "us-east-1";

            const s3Client = new S3Client({
              region: REGION,
              credentials: fromCognitoIdentityPool({
                clientConfig: { region: REGION }, // Configure the underlying CognitoIdentityClient.
                identityPoolId: outputs.idPoolIdAuthenticatied,
                logins: {
                        [`cognito-idp.${REGION}.amazonaws.com/${outputs.userPoolId}`]: session.tokens?.idToken?.toString() as string,
                    },
              })
            });
            console.log(
                await s3Client.send(
                    new ListObjectsCommand({
                        Bucket: outputs.s3Bucket,
                    })
                )
            )


            console.log("id token", session.tokens?.idToken)
            console.log("access token", session.tokens?.accessToken)
            const response = await fetch(`${BASE_URL}/todo`, {
                    headers: {
                        Authorization: `Bearer ${session.tokens?.accessToken}`
                    }
                });
            const result = await response.json();
            console.log("RESULT", result);
            
            setTodo(result);
        }

        FetchTodo()
    }, [])

    return (
    <div>
      <ul>
        <li>
        TODO ID: {todo?.id}
        </li>
        <li>
        TODO task: {todo?.task}
        </li>
        <li>
        TODO tenantId: {todo?.tenantId}
        </li>
      </ul>
    </div>
    )
}
