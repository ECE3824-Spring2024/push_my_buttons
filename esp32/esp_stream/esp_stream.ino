#include <Redis.h>

#ifdef HAL_ESP32_HAL_H_ // ESP32
#include <WiFiClient.h>
#include <WiFi.h>
#else

#ifdef CORE_ESP8266_FEATURES_H // ESP8266
#include <ESP8266WiFi.h>
#endif
#endif

#define buttonA 4
#define buttonB 5
#define LED 2
#define bounce 150

#define wifiBlue 19
#define wifiRed 18

#define reset 23

// Set wifi Address
// #define WIFI_SSID "Vandaley Industries"
// #define WIFI_PASSWORD "15Tattergrace48"

#define WIFI_SSID "Myphone"
#define WIFI_PASSWORD "12345678"

// #define WIFI_SSID "tuiot"
// #define WIFI_PASSWORD "bruc3l0w3"

//Set redis server
#define REDIS_ADDR "redis-12305.c270.us-east-1-3.ec2.cloud.redislabs.co"
#define REDIS_PORT 12305
#define REDIS_PASSWORD "mJxWBQYqdbSipoLAcc59qUN1zPQdDMmD"

//set streams field
#define STREAMS_KEY "A-stream"
#define STREAMS_GROUP_1 "button"


bool buttonStateA = 0;
bool buttonStateB = 0;
int aCount = 0;
int bCount =0;

void blink(int led, int dlay){
        digitalWrite(LED, HIGH);
        delay(dlay);
        digitalWrite(LED, LOW);
}

void redisXadd(char* but){
  WiFiClient redisConn;
  if (!redisConn.connect(REDIS_ADDR, REDIS_PORT)){

      Serial.println("Failed to connect to the Redis server!");
      digitalWrite(wifiBlue, HIGH);
      digitalWrite(wifiRed, HIGH);
      return;
  }

  Redis redis(redisConn);
  auto connRet = redis.authenticate(REDIS_PASSWORD);

  if (connRet == RedisSuccess){

      Serial.println("Connected to the Redis server!");
  }

  else{
      Serial.printf("Failed to authenticate to the Redis server! Errno: %d\n", (int)connRet);
      return;
  }

  if(but == "A"){
      aCount= redis.get(but).toInt();
      aCount++;
      String newValue = String(aCount);
      redis.set("A", newValue.c_str());
    }
    else{
      bCount= redis.get(but).toInt();
      bCount++;
      String newValue = String(bCount);
      redis.set("B", newValue.c_str());
    }

    redis.xadd(STREAMS_KEY, "*", STREAMS_GROUP_1, but);

  // close connection
  redisConn.stop();
  Serial.print("Connection closed!");
}

void wificonnect(){
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to the WiFi");
  digitalWrite(wifiRed,HIGH);

  while (WiFi.status() != WL_CONNECTED){
    digitalWrite(wifiRed,HIGH);
    delay(250);
    Serial.print(".");
    digitalWrite(wifiRed,LOW);
    delay(250);
  }
  Serial.println();
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  digitalWrite(wifiRed, LOW);
  digitalWrite(wifiBlue, HIGH);
}

  void setup()
{
  Serial.begin(115200);
  Serial.println();
  pinMode(reset, OUTPUT);
  pinMode(LED, OUTPUT);
  pinMode(buttonA, INPUT);
  pinMode(buttonB, INPUT);
  pinMode(wifiBlue, OUTPUT);
  pinMode(wifiRed, OUTPUT);
  wificonnect();
}

void loop(){
  while(WiFi.status() == WL_CONNECTED){
    digitalWrite(wifiBlue, HIGH);
  
    
    buttonStateA = digitalRead(buttonA);
    buttonStateB = digitalRead(buttonB);

    if( buttonStateA == HIGH){
      delay(bounce);
      redisXadd("A");
      blink(LED, 500);
    }

    if( buttonStateB == HIGH){
      delay(bounce);
      redisXadd("B");
      blink(LED, 1000);
    }
  }

  if (WiFi.status() != WL_CONNECTED){
    digitalWrite(wifiBlue, LOW);
    esp_restart();
  }
}
