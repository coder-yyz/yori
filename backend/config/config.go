package config

import (
	"log"
	"os"
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DBConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port    string
	Mode    string
	BaseURL string `mapstructure:"base_url"`
}

type DBConfig struct {
	DSN string
}

type JWTConfig struct {
	Secret string
	Expire  int
}

var Conf Config

func Init() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "dev"
	}

	viper.SetConfigName("config." + env)
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("配置文件加载失败: %v", err)
	}

	if err := viper.Unmarshal(&Conf); err != nil {
		log.Fatalf("配置解析失败: %v", err)
	}

	log.Printf("加载环境配置: %s", env)
}
