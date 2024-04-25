#include <Redis.h>
#include <esp_wifi.h>

#ifdef HAL_ESP32_HAL_H_ // ESP32
#include <WiFiClient.h>
#include <WiFi.h>
#else

#ifdef CORE_ESP8266_FEATURES_H // ESP8266
#include <ESP8266WiFi.h>
#endif
#endif

#define buttonA 5
#define buttonB 4
#define LED 2
#define bounce 150

#define wifiBlue 22
#define wifiRed 19

#define aRed 13
#define aGreen 12
#define aBlue 14

#define bRed    27
#define bGreen  26
#define bBlue   25



// Set wifi Address
// #define WIFI_SSID "Vandaley Industries"
// #define WIFI_PASSWORD "15Tattergrace48"

// #define WIFI_SSID "Myphone"
// #define WIFI_PASSWORD "12345678"

#define WIFI_SSID "tuiot"
#define WIFI_PASSWORD "bruc3l0w3"

//Set redis server
#define REDIS_ADDR "redis-12305.c270.us-east-1-3.ec2.cloud.redislabs.com"
#define REDIS_PORT 12305
#define REDIS_PASSWORD "mJxWBQYqdbSipoLAcc59qUN1zPQdDMmD"

//set streams field
#define STREAMS_KEY "A-stream"
#define STREAMS_GROUP_1 "button"

bool buttonStateA = 0;
bool buttonStateB = 0;
int aCount = 0;
int bCount =0;

uint8_t newMACAddress[] = {0x08, 0xD1, 0xF9, 0x26, 0x35, 0x14};



void blink(int led, int dlay, int blinks){
  for (int i = 0 ; i < blinks ; i++){
    digitalWrite(led, HIGH);
    delay(dlay);
    digitalWrite(led, LOW);
    delay(dlay);
  }
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

  esp_wifi_set_mac(WIFI_IF_STA, &newMACAddress[0]);
  
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

  pinMode(LED, OUTPUT);
  pinMode(buttonA, INPUT);
  pinMode(buttonB, INPUT);

  pinMode(wifiBlue, OUTPUT);
  pinMode(wifiRed, OUTPUT);

  pinMode(aRed,    OUTPUT);
  pinMode(aGreen,  OUTPUT);
  pinMode(aBlue,   OUTPUT);

  pinMode(bRed,    OUTPUT);
  pinMode(bGreen,  OUTPUT);
  pinMode(bBlue,   OUTPUT);




  wificonnect();

  Serial.println(WiFi.macAddress());

  digitalWrite(aGreen, HIGH);
  digitalWrite(bGreen, HIGH);

  
}

void loop(){
  while(WiFi.status() == WL_CONNECTED){
    digitalWrite(wifiBlue, HIGH);
  
    
    buttonStateA = digitalRead(buttonA);
    buttonStateB = digitalRead(buttonB);

    if( buttonStateA == HIGH){
      digitalWrite(aGreen, LOW);
      digitalWrite(bGreen, LOW);

      digitalWrite(aRed, HIGH);
      digitalWrite(bRed, HIGH);

      delay(bounce);
      redisXadd("A");

      digitalWrite(aRed, LOW);

      blink(aGreen, 150, 4);
      digitalWrite(bRed, LOW);
      digitalWrite(aGreen, HIGH);
      digitalWrite(bGreen, HIGH);

    }

    if( buttonStateB == HIGH){

      digitalWrite(aGreen, LOW);
      digitalWrite(bGreen, LOW);

      digitalWrite(aRed, HIGH);
      digitalWrite(bRed, HIGH);


      delay(bounce);
      redisXadd("B");

      digitalWrite(bRed, LOW);

      blink(bGreen, 150, 4);
      
      digitalWrite(bRed, LOW);
      digitalWrite(aGreen, HIGH);
      digitalWrite(bGreen, HIGH);
    }
  }

  if (WiFi.status() != WL_CONNECTED){
    digitalWrite(wifiBlue, LOW);
    esp_restart();
  }
}
