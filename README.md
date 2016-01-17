# Playlists-Node.js-MEAN 
You are assigned to design and implement an application for playlists containing YouTube videos. Users should be able to register into the application and create playlists.

Users have profiles with information about them – first and last name, e-mail address, a profile image and links to their Facebook and YouTube accounts. The profile image is optional and should have a default one, if such is not provided. Facebook and YouTube accounts are optional too. Additionally users have rating which is accumulated from their playlists.

Playlists can be created only by registered users. Each playlist should have title, description, video URLs, category ("Movies", "Hip-hop", "Chalgiika bace", etc. (choose them not so wisely)), creator, creation date and whether the playlist is public or private. Public playlists can be visible to anyone. Private playlists are visible only to their creator and people he/she chooses explicitly. Playlist categories are constant (the user cannot add, edit or delete them).

Each playlist can receive rating from 1 to 5. The total average rating is shown for each playlist. Additionally the users have rating – the average from their playlists. All users that can view the playlists can give rating. Anonymous users cannot give rating but can browse the playlists. All users that can view particular playlist can leave comments on it.

The system should be implemented as a server-side web application in Node.js using Jade view engine.

## Data Layer ##
- Use **Mongoose** as ODM engine and **MongoDB** as database storage engine.
- **Data layer abstraction** – the data layer should be implemented as an abstract module.

Design a simple data layer to hold **users** and **playlists**
- Each user has username, password and all other fields to fulfil the above requirements.
