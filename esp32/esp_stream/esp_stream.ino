#include <Redis.h>

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

#define STREAMS_KEY "A-stream"
#define STREAMS_GROUP_1 "button"

#define VALIDATE_VECTOR_STRING_RESULT(result, command) \
  result = command; \
  if(redis->isErrorReturn(result)) { \
    Serial.println(">> This was an error <<"); \
    Serial.println(result[0]); \
  } else { \
    Serial.println(">> Success <<"); \
    print_vector(result); \
  }

  void setup()
{
  Serial.begin(115200);
  Serial.println();

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

  WiFiClient redisConn;
  if (!redisConn.connect(REDIS_ADDR, REDIS_PORT))
  {
      Serial.println("Failed to connect to the Redis server!");
      return;
  }

  Redis redis(redisConn);
  auto connRet = redis.authenticate(REDIS_PASSWORD);
  if (connRet == RedisSuccess)
  {
      Serial.println("Connected to the Redis server!");
  }
  else
  {
      Serial.printf("Failed to authenticate to the Redis server! Errno: %d\n", (int)connRet);
      return;
  }


    redis.xadd(STREAMS_KEY, "*", STREAMS_GROUP_1, "A");

  // close connection
  redisConn.stop();
  Serial.print("Connection closed!");
}

void loop(){

}