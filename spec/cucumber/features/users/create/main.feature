Feature: Create User

  Client should be able to send a request to out API in order to create a user.
  Our API should also validate the structure of the payload and respond with an error if it is invalid.


  Scenario: Empty Payload

  If the client sends a POST request to /users with unsupported payload ,it should receiver a response with
  a 4xx status code.

    When the client creates a POST request to /users
    And attaches a generic empty payload
    And sends the request
    Then our API should respond with a 400 HTTP status code
    And the payload of the response should be a JSON object
    And contains a message property which says "Payload should not be empty"


  Scenario: Payload using unsupported Media Type

  If the client sends a POST request to /users with a payload that is not JSON,
  it should receive a response with 415 Unsupported Media Type HTTP status code.

    When the client creates a POST request to /users
    And attaches a generic non-JSON payload
    And sends the request
    Then our API should respond with a 415 HTTP status code
    And the payload of the response should be a JSON object
    And contains a message property which says "Content type header should always be JSON"

  Scenario: Malformed JSON Payload

  If the client sends a POST request to /users with an payload that is
  malformed,
  it should receive a response with a 400 Unsupported Media Type HTTP
  status code.

    When the client creates a POST request to /users
    And attaches a generic malformed payload
    And sends the request
    Then our API should respond with a 400 HTTP status code
    And the payload of the response should be a JSON object
    And contains a message property which says "Payload should be in JSON format"


  Scenario Outline: Bad Request Payload

    When the client creates a POST request to /users
    And attaches a Create User payload which is missing the <missingFields> field
    And sends the request
    Then our API should respond with a 400 HTTP status code
    And the payload of the response should be a JSON object
    And contains a message property which says "Payload must contain at least the email and password fields"

    Examples:

      | missingFields |
      | email         |
      | password      |


  Scenario Outline: Request Payload with Properties of Unsupported Type
    When the client creates a POST request to /users
    And attaches a Create User payload where the <field> field is not a <type>
    And sends the request
    Then our API should respond with a 400 HTTP status code
    And the payload of the response should be a JSON object
    And contains a message property which says "The email and password fields must be of type string"

    Examples:
      | field    | type   |
      | email    | string |
      | password | string |


  Scenario Outline: Request Payload with invalid email format

    When the client creates a POST request to /users
    And attaches a Create User payload where the email field is exactly <email>
    And sends the request
    Then our API should respond with a 400 HTTP status code
    And the payload of the response should be a JSON object
    And contains a message property which says "The email field must be a valid email."

    Examples:

      | email     |
      | a238juqy2 |
      | a@1.2.3.4 |
      | a,b,c@!!  |


  Scenario: Minimal Valid User

    When the client creates a POST request to /users
    And attaches a valid Create User payload
    And sends the request
    Then our API should respond with a 201 HTTP status code
    And the payload of the response should be a string
    And the payload object should be added to the database, grouped under the "user" type
    And newly-created user should be deleted