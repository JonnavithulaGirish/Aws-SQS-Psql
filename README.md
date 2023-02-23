# Aws-SQS-Psql

Post successful build and launch you would see a screen something like this:

![image](https://user-images.githubusercontent.com/23165664/220879545-79cc6136-b162-42e1-b98c-0b91438f4833.png)


## Steps to run the repository with explanation 
    1)  git clone https://github.com/JonnavithulaGirish/Aws-SQS-Psql.git
    2)  Make sure you have Node.js installed in your local machine.
    3)  npm install [(Note:: all the node packages are already included in the repository,
    Just to be on safe side you can run this step)].
    4)  In the directory of the repository run the following command : 
    docker compose up [(this will make sure to lauch the docker container containing the 
    following images- "fetchdocker/data-takehome-postgres", "fetchdocker/data-takehome-localstack")]
    5) Once the above step is successful in a new cmd run the following command: node app.
    6) You should now see the application to be up and running in localhost:3000.
    7) On opening this localhost:3000, you would the a screen as mentioned above.


## Steps to run the repository -- simple version
    1)  git clone https://github.com/JonnavithulaGirish/Aws-SQS-Psql.git
    2)  npm install
    3)  docker compose up
    4)  node app



## Some of the decisions taken to build this solution:

### How will you read messages from the queue?
    Using aws-sdk node module that is configured with the queue-url
    (http://localhost:4566/000000000000/login-queue) and configuration set as follows:
    1) "accessKeyId": "test"
    2) "secretAccessKey": "test"
    3) "region": "us-east-1"

    One challenge here would be to poll the queue continuously to check for new messages.
    Inorder to achieve this, I am polling the queue every second.
   
   
### What type of data structures should be used?
    Each message is Javascript object which is just a collection key value pairs. 
   
    List of Messages will be stored as an array of Javascript Objects.
   

### How will you mask the PII data so that duplicate values can be identified?
    Masking the PII data is done using SHA256 digest of the original string. I have used
    this approach because SHA256 provides strong cryptograpic security with a very low collision
    probabilty and adding to this, duplicates will still point to the same hash digest that will help
    us to easily identify duplicates without compromising on security.
  
  
### What will be your strategy for connecting and writing to Postgres?
    On receiving data from message queue and if it contains vaild data, we will be masking the PII
    related data and finally connect to Postgres and Insert the new message received.
  
### Where and how will your application run?
    Application will be run locally for development which launces an express.js server aimed to do the following functionalities:
    1) Actively Poll AWS SQS queue and check for new messages.
    2) Insert New messages on to Postgres.
    3) Render User login details on a UI by getting data from Postgres.


## Assignment Questions

### How would you deploy this application in production?
    1) Package.json file is already created for this project which contains production scripts to
    launch a build on any container. 
    (refer-- https://github.com/JonnavithulaGirish/Aws-SQS-Psql/blob/main/package.json)
    2) Inorder to build Node.js application in production we should run the following command that
    would create a build folder : **ng build --prod**
    3) To automate build and deployment process we could create github CI/CD pipeline which runs the
    above command and also does codechecks(such as unittests,integration tests and static code analysis).
    Once all these checks pass we can create a container with Node.js buildpack that would run the start
    script declared in package.json file.

### What other components would you want to add to make this production ready?
    1) Ideally it would also be great to add blue-green deployment strategy to make sure that the live
    traffic is not affected by any active production releases. We can achieve this by adding additional 
    steps on the CI/CD pipeline and make sure that the build is first pushed on to a green container and
    once the testing is done on this layer, we could elevate the build to production.
    2) It would be great to move credential-related data onto HashiCorp Vault or any similar service which
    could help us update configs on-the-fly (such as Postgres login credentials and AWS config related data)
    that can be changed directly without the necessity of rebuilding the application.

### How can this application scale with a growing dataset.
    I beilieve the following approaches can be followed to scale the application:
    1) Horizontal scale up of the node.js application if the live user traffic to view User login data on the dashboard increases.
    2) If we take the above approach we should probably implement a load balancer to route the user request to
    the container which is handling least number of user request at the current period of time.
    3) We could use both vertical and horizontal scaling in case of PostgresSQL: Since amount of
    data stored will increase with growing dataset, it would be optimal to expand the PostgrsSQL
    resource vertically to a certain exptent but post this we could horizontally scale Postgres.
    4) It also becomes extremely important for us to make sure that postgres cluster is highly available.
    Inorder to achieve this we should add redundancy nodes to handle postgres crashes and runtime failures.
 

### How can PII be recovered later on?
    Since we are using SHA256 to mask PII related data, recovery of this data would not be possible.
    However, if we would require the data to be recovered later, we could use other encryption algorithms
    where decryption would use some kind of Public/private key. 

### What are the assumptions you made?
    Here are some of the assumptions I have made:
    1) PII data need not be recoverable, it should be masked and the only requirement was to easily
    find duplicates even with masked data.
    2) Application would poll the queue every second and deletes the entry from queue after 1 minute
    (ideally this not necessary in this scenario but would be useful if other applcations are also
    listening to the same message queue).
    3) It is required for us to render data onto somekind of dashboard.
    4) Data received on the queue will definely contain the following fields : user_id, ip, device_id.
    If not these messages will be ignored.



## In Conclusion:
#### The project aims to read data from AWS SQS queue every second and if any new message is received it'll push the entry into PostgresSql.

#### TechStack Used
1) Node.js
2) Express.js
3) PostgresSQL


#### Node Modules Used
1) express
2) aws-sdk
3) pg
4) node:crypto
