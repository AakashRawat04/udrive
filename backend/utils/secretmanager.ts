import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export const getSecretValue = async (secretName: string) => {
	const client = new SecretsManagerClient({
		region: "ap-south-1",
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
		},
	});
	const response = await client.send(
		new GetSecretValueCommand({
			SecretId: secretName,
			VersionStage: "AWSCURRENT",
		})
	);

	if (!response.SecretString) {
		console.log("No SecretString found");
		return;
	}
	return response.SecretString;
};
