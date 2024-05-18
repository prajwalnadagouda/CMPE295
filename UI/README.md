ollow the below steps to start the project:

Starting the Backend Server:

1. Create a .env file in the path **CMPE295/UI/server**
2. Please paste the following lines in the created .env file, and fill in the all the corresponding credentials:

   ```
   DB= #MongoDB Connection String
   JWTPRIVATEKEY= #JWT Private Key
   SALT= #Salt Factor Hashing
   GOOGLE_CLIENT_ID= #Client ID provided by Google
   FRONTEND_ORIGIN= #Hosted Frondend Application's URL
   ```
3. Save the .env file
4. Run the following command to install all the necessary packages

   ```
   npm install
   ```
5. After all the packages are installed run the following from the path **CMPE295/UI/server**

   ```
   npm start
   ```


Staring the Frontend Application:

1. Create a .env file in the path **CMPE295/UI/client**
2. Please pathe the following lines in the created .env file, and fill in all the corresponding credentials:

   ```
   REACT_APP_GOOGLE_MAPS_API_KEY= #API key to interact with the Google Map, enable Places, Maps and Directions API on GCP
   REACT_APP_BACKEND_URI= #Hosted Backend Application's URL
   ```
3. Save the .env file
4. Run the following command to install all the necessary packages

   ```
   npm install
   ```
5. After all the packages are installed run the following from the path **CMPE295/UI/client**

   ```
   npm start
   ```