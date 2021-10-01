# BlackJack-API

A backend api with endpoints to play `multiplayer blackjack game`

---
## Requirements

- You will only need Node.js, NPM-node package manager and mongoDB as database installed in your environment.

- Follow the below steps to install them individually

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0



### MongoDB

- #### `MongoDB` installation on Ubuntu
    ```bash
    wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
    sudo apt update
    sudo apt install -y mongodb-org
    ```
  You can find more information about the installation on the [official MongoDB website](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)


## Cloning this repository

    $ https://github.com/pranavkutty/blackjack-api.git

## Configure app

- Follow the below steps to configure the app and server.
- Start the mongodb server.

    $ sudo mongod

- Execute the `npm install` to install dependencies from packages.json and also start the server. The app has following dependencies:

      dependencies - express,mongoose
      devDependencies - dotenv, nodemon

- Ensure that the databse url is assigned properly in the `.env` file.


## Running the project

- Execute the following from the `source` folder.

    $ node server.js

<br/>

# API ENDPOINTS

The API endpoints to the control the backend is described below.

## CREATE a new user

### Request

`POST API /api/v1/create_user`

    curl --location --request POST 'http://localhost:8081/api/v1/create_user' 
    --header 'Content-Type: application/json' 
    --data-raw '{
    "name": "testUser2",
    "coins": 1180
    }'

### Response - userid of new user

    {
        "user_id": "6156fa2f46be764cb62b2377"
    }

## CREATE a new game

### Request

`POST /api/v1/create_game`

    curl --location --request POST 'http://localhost:8081/api/v1/create_game'
    --header 'Content-Type: application/json' 
    --data-raw '{
    "players": [
        "6156fa1b46be764cb62b2375",
        "6156fa2f46be764cb62b2377"
    ],
    "decks": 2
    }'

### Response - id of new game

    {
        "game_id": "6156fbe17123934f41eaa6c6"
    }

## START new round or get status of current round

### Request

`POST /api/v1/deal`

    curl --location --request POST 'http://localhost:8081/api/v1/deal' 
    --header 'Content-Type: application/json' 
    --data-raw '{
    "id": "6156fbe17123934f41eaa6c6",
    "coins": [20,30]
    }'

### Response - round info with cards in hands

    {
        "round id": "6156fbed7123934f41eaa6cd",
        "rounds_finished": false,
        "dealer_cards": [
            "JD",
            "AC"
        ],
        "turn": "6156fa1b46be764cb62b2375",
        "player_cards": {
            "6156fa1b46be764cb62b2375": {
                "handid": "6156fbee7123934f41eaa6d1",
                "cards": [
                    "8D",
                    "9D"
                ]
            },
            "6156fa2f46be764cb62b2377": {
                "handid": "6156fbef7123934f41eaa6d5",
                "cards": [
                    "KS",
                    "6S"
                ]
            }
        }
    }

## INSURANCE

### Request

`POST /api/v1/insurance`

    curl --location --request POST 'http://localhost:8081/api/v1/insurance' 
    --header 'Content-Type: application/json' 
    --data-raw '{
    "round_id": "6156fa4946be764cb62b2380",
    "insurance": [{
            "hand_id": "6156fbee7123934f41eaa6d1",
            "insurance": 12
        }
    ]
    }'

### Response

    {
        "msg": "insurance bet added"
    }

## HIT

### Request

`GET API /api/v1/hit/:hand_id`

    curl --location --request GET 'http://localhost:8081/api/v1/hit/6156fbee7123934f41eaa6d1' 
    
### Response - card drawn and total hand value

    { 
        "card drawn": ["8H"], 
        "hand_value": 8 
    }

## STAND

### Request

`GET /api/v1/stand/:hand_id`

    curl --location --request GET 'http://localhost:8081/api/v1/stand/6156fbef7123934f41eaa6d5'

### Response - cards in hand and new hand status

    {
        "cards": [
            "KS",
            "6S"
        ],
        "handstatus": "INACTIVE"
    }
## DOUBLE_DOWN

### Request

`GET /api/v1/double_down/:hand_id`

    curl --location --request GET 'http://localhost:8081/api/v1/double_down/6156fbef7123934f41eaa6d5'

### Response - message and new bet

    {
        "message": "bet doubled",
        "bet": 60
    }

## SPLIT

### Request

`GET /api/v1/split/:hand_id`

    curl --location --request GET 'http://localhost:8081/api/v1/split/6156fbef7123934f41eaa6d5'

### Response

    {
        "message": "cards split",
        "new_hands": {
            "one": {
                "cards": [
                    "5S"
                ],
                "handValue": 5,
                "bet": 30,
                "insuranceCoins": 0,
                "handStatus": "ACTIVE",
                "turn": 0,
                "payoff": 0
            },
            "two": {
                "cards": [
                    "5H"
                ],
                "handValue": 5,
                "bet": 30,
                "insuranceCoins": 0,
                "handStatus": "ACTIVE",
                "turn": 0,
                "payoff": 0
            },
            "_id": "6156fbef7123934f41eaa6d5",
            "__v": 0,
            "gameid": "6156fbe17123934f41eaa6c6"
        }
    }
    ## DOUBLE_DOWN

## GAME STATUS

### Request - complete game snapshot

`GET api/v1/status/:game_id`

    curl --location --request GET 'http://localhost:8081/api/v1/status/6156fbe17123934f41eaa6c6'

### Response

    {
        "players": [
            "6156fa1b46be764cb62b2375",
            "6156fa2f46be764cb62b2377"
        ],
        "finished": true,
        "deck": ["AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AS", "2S", "3S", "4S", "5S", "7S", "8S", "9S", "10S", "JS", "QS", "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AD", "2D", "3D", "4D", "5D", "6D", "7D", "10D", "QD", "KD", "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"],
        "rounds": [
            {
                "finished": false,
                "dealerCards": [
                    "7D",
                    "AC"
                ],
                "turn": 2,
                "hands": [
                    {
                        "one": {
                            "cards": [
                                "9D",
                                "KC"
                            ],
                            "handValue": 19,
                            "bet": 20,
                            "insuranceCoins": 12,
                            "handStatus": "INACTIVE",
                            "turn": 2,
                            "payoff": 30
                        },
                        "two": {
                            "cards": [],
                            "handValue": 0,
                            "bet": 0,
                            "insuranceCoins": 0,
                            "handStatus": "INACTIVE",
                            "turn": 0,
                            "payoff": 0
                        },
                        "_id": "6156fbee7123934f41eaa6d1",
                        "__v": 2,
                        "gameid": "6156fbe17123934f41eaa6c6"
                    },
                    {
                        "one": {
                            "cards": [
                                "5S"
                            ],
                            "handValue": 5,
                            "bet": 30,
                            "insuranceCoins": 0,
                            "handStatus": "ACTIVE",
                            "turn": 0,
                            "payoff": 0
                        },
                        "two": {
                            "cards": [
                                "5H"
                            ],
                            "handValue": 5,
                            "bet": 30,
                            "insuranceCoins": 0,
                            "handStatus": "ACTIVE",
                            "turn": 0,
                            "payoff": 0
                        },
                        "_id": "6156fbef7123934f41eaa6d5",
                        "__v": 1,
                        "gameid": "6156fbe17123934f41eaa6c6"
                    }
                ],
                "winner": [
                    "6156fa1b46be764cb62b2375"
                ]
            }
        ]
    }
## FINISH_GAME

### Request

`GET api/v1/finish_game/:game_id`

    curl --location --request GET 'http://localhost:8081/api/v1/finish_game/6156fbe17123934f41eaa6c6'

### Response

    {
        "message": "game finished"
    }
    
## WINNERS

### Request

`GET api/v1/winner/:game_id`

    curl --location --request GET 'http://localhost:8081/api/v1/winner/6156fbe17123934f41eaa6c6'

### Response - roundid and winners array

    {
        "6156fbed7123934f41eaa6cd": ["6156fa1b46be764cb62b2375"]
    }
<br/>
