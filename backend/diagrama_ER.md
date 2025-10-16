```mermaid
---
title: Diagrama ER per gestionar la red social
---
erDiagram
    User{
        string name
    }
    UserProfile {
        int userId PK
        string nickname
        string description
        string profilePic
        string email
    }

    PlayList {
        int playlistId PK
        string name
        string description
        string topic
        date createdAt
    }


    Generes{
        string name
    }

    Follow {
        date followDate
    }


    Song {
        int songId PK
        string name
        mp4 file
        date uploadDate
        int ownerId
    }
    ActionForYouPage {
        string reasonWhyIsRecomend
    }


    Favorite {
        date createdAt
    }

    Rating {
        int value
    }


    Comment {
        int anonymous_level
        string content
        date createdAt
    }
    Message {
        string content
        date sentAt
    }
    User 1 to 1 UserProfile: is
    PlayList }o--o{ Song : "contains"
    UserProfile one or more to one or more PlayList: owner
    UserProfile }|--|{ PlayList : watched

    UserProfile ||--|| Favorite : "adds"
    Favorite ||--o{ Song : "Favorite songs"
    Rating ||--|| Song : "Associat"
    UserProfile ||--o{ Rating: "done by"

    UserProfile ||--o{ Comment : "Commented"
    Message }o--|| Follow : "Send"
    Comment ||--|| Song : "In"

    UserProfile ||--o{ Follow : "follows"
    UserProfile ||--o{ Follow : "followed"

    ActionForYouPage ||--o{ Follow : "Recomend something"
    UserProfile ||--o{ Generes: "Favorite Generes"
    Song ||--o{ Generes:"Generos"
    Song ||--o{ UserProfile : "Author"



```
    classDef weakEntity fill:#f9f,stroke-dasharray: 5 5
    class ActionForYouPage weakEntity



| Mètode | URL                                                 | Descripció                   |
| ------ | --------------------------------------------------- | ---------------------------- |
| GET    | `/api/v1/userprofile/`                                    |           |
| POST   | `/api/v1/userprofile/`                                    |             |
| GET    | `/api/v1/userprofile/{id}/`                               |         |
| PUT    | `/api/v1/userprofile/{id}/`                               | Modificar la informació d'un Usuari    |
| PATCH  | `/api/v1/userprofile/{id}/`                               | Modificar la informació d'un Usuari   |
| DELETE | `/api/v1/userprofile/{id}/`                               | Eliminar un Usuari         |
| GET    | `/api/v1/playlist/`                                    | Llistat de cançons          |
| POST   | `/api/v1/playlist/`                                    | Crear una llista de cançons (playlist)            |
| GET    | `/api/v1/playlist/{id}/`                               | Veure la informació d'una playlist        |
| PUT    | `/api/v1/playlist/{id}/`                               | Modificar la informació playlist    |
| PATCH  | `/api/v1/playlist/{id}/`                               | Modificar la informació playlist    |
| DELETE | `/api/v1/playlist/{id}/`                               | Eliminar una partida         |
| GET    | `/api/v1/playlist/{id}/songs/`                       | Llistat de jugadors en una partida    |
| POST   | `/api/v1/playlist/{id}/songs/`                       | Afegeix una canço a la playlist (codi: #{"song_id":1})      |
| GET    | `/api/v1/playlist/{gid}/songs/{pid}/`                | Veure les dades d'un jugador de la partida     |
| DELETE | `/api/v1/playlist/{gid}/songs/{pid}/`                | Eliminar un jugador de la partida   |

