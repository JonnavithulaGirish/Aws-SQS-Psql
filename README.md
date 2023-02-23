# Aws-SQS-Psql

The project aims to read data from AWS SQS queue every second and if any new message is received it'll push the entry into PostgresSql.

Post successful build and launch you would see a screen something like this:
![image](https://user-images.githubusercontent.com/23165664/220879545-79cc6136-b162-42e1-b98c-0b91438f4833.png)


## Steps to run the repository with explanation 
1)  git clone **https://github.com/JonnavithulaGirish/Aws-SQS-Psql.git**
2)  Make sure you have **Node.js installed** in your local machine.
3)  **npm install** -- (Note:: all the node packages are already included in the repository, Just to be on safe side you can run this step).
4)  In the directory of the repository run the following command : **docker compose up** -- (this will make sure to lauch the docker container containing the following images- "fetchdocker/data-takehome-postgres", "fetchdocker/data-takehome-localstack")
5) Once the above step is successful in a new cmd run the following command: **node app**.
6) You should now see the application to be up and running in **localhost:3000**.
7) On opening this **localhost:3000**, you would the a screen as mentioned above.


## Steps to run the repository -- simple version
1)  git clone **https://github.com/JonnavithulaGirish/Aws-SQS-Psql.git**
2)  **npm install**
3)  **docker compose up**
4)  **node app**



