#include <Redis.h>

// Include Wi-Fi libraries based on the platform
#ifdef HAL_ESP32_HAL_H_ // ESP32
#include <WiFiClient.h>
#include <WiFi.h>
#else
#ifdef CORE_ESP8266_FEATURES_H // ESP8266
#include <ESP8266WiFi.h>
#endif
#endif

#define WIFI_SSID "Vandaley Industries"
#define WIFI_PASSWORD "15Tattergrace48"

// #define WIFI_SSID "Myphone"
// #define WIFI_PASSWORD "12345678"

// #define WIFI_SSID "tuiot"
// #define WIFI_PASSWORD "bruc3l0w3"

#define REDIS_ADDR "redis-12305.c270.us-east-1-3.ec2.cloud.redislabs.com"
#define REDIS_PORT 12305
#define REDIS_PASSWORD "mJxWBQYqdbSipoLAcc59qUN1zPQdDMmD"


// Pin definitions
#define button 4
#define LED 2
#define dlay 500
#define bounce 150

// Global variables
int buttonState = 0;
int a = 0;
void setup()
{

    // Initialize pin modes
    pinMode(button, INPUT);
    pinMode(LED, OUTPUT);

    // Initialize serial communication
    Serial.begin(115200);
    Serial.println();

    // Connect to Wi-Fi
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to the WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(250);
        Serial.print(".");
    }
    Serial.println();
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void loop()
{
    // Read button state
    buttonState = digitalRead(button);

    // If button is pressed
    if(buttonState == HIGH)
    {
        // Debounce
        delay(bounce);

        // Connect to Redis
        WiFiClient redisConn;
        if (!redisConn.connect(REDIS_ADDR, REDIS_PORT))
        {
            Serial.println("Failed to connect to the Redis server!");
            return;
        }
        // Authenticate to Redis
        Redis redis(redisConn);
        auto connRet = redis.authenticate(REDIS_PASSWORD);
        if (connRet != RedisSuccess)
        {
            Serial.printf("Failed to authenticate to the Redis server! Errno: %d\n", (int)connRet);
            return;
        }

        // Retrieve the current value of "A" from Redis
         a= redis.get("A").toInt();

        // Increment the value of "A"
        a++;

        // Convert the incremented value to string
        String newValue = String(a);

        // Set the new value of "A" in Redis
        redis.set("A", newValue.c_str()); // Convert String to const char*

        // Toggle LED
        digitalWrite(LED, HIGH);
        delay(dlay);
        digitalWrite(LED, LOW);
        redisConn.stop();
    }
}
