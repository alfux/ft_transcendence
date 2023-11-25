import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

import { User42Api } from './user42api.interface';
import { config_42 } from 'src/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID: config_42.key,
      clientSecret: config_42.secret,
      callbackURL: config_42.redirect,
      profileFields: {
        'id': function (obj) { return String(obj.id); },
        'username': 'login',
        'displayName': 'displayname',
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        'profileUrl': 'url',
        'email': 'email',
        'image': (obj) => {
          return obj.image.link;
        },
      }
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<User42Api> {
    // You can customize the user data you want to save in the database.

    const user = {
      id: profile.id,
      username: profile.username,
      image: profile._json.image.link,
    };
    return user;
  }
}
