const messages = [
    {
        _id: 1,
        text: 'Missed call from Michael',
        createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
        system: true,
    },
    {
        _id: 2,
        text: 'Hello developer',
        createdAt: new Date(Date.UTC(2016, 5, 12, 17, 20, 0)),
        user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
    },
    {
        _id: 3,
        text: 'Hi! I work from home today!',
        createdAt: new Date(Date.UTC(2016, 5, 13, 17, 20, 0)),
        user: {
            _id: 1,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
        // image: 'https://placeimg.com/960/540/any',
    },
    {
        _id: 4,
        text: 'This is a quick reply. Do you love Gifted Chat? (radio) KEEP IT',
        createdAt: new Date(Date.UTC(2016, 5, 14, 17, 20, 0)),
        user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
        // quickReplies: {
        //     type: 'radio', // or 'checkbox',
        //     keepIt: true,
        //     values: [
        //         {
        //             title: '😋 Yes',
        //             value: 'yes',
        //         },
        //         {
        //             title: '📷 Yes, let me show you with a picture!',
        //             value: 'yes_picture',
        //         },
        //         {
        //             title: '😞 Nope. What?',
        //             value: 'no',
        //         },
        //     ],
        // },
    },
    {
        _id: 5,
        text: 'This is a quick reply. Do you love Gifted Chat? (checkbox)',
        createdAt: new Date(Date.UTC(2016, 5, 15, 17, 20, 0)),
        user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
        // quickReplies: {
        //     type: 'checkbox', // or 'radio',
        //     values: [
        //         {
        //             title: 'Yes',
        //             value: 'yes',
        //         },
        //         {
        //             title: 'Yes, let me show you with a picture!',
        //             value: 'yes_picture',
        //         },
        //         {
        //             title: 'Nope. What?',
        //             value: 'no',
        //         },
        //     ],
        // },
    },
    {
        _id: 6,
        text: 'Come on!',
        createdAt: new Date(Date.UTC(2016, 5, 15, 18, 20, 0)),
        user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
    },
    {
        _id: 7,
        text: `The popular weekly market raises much needed funding for Fairfax High School arts and leadership programming.`,
        createdAt: new Date(Date.UTC(2016, 5, 13, 17, 20, 0)),
        user: {
            _id: 1,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
        },
    },
  ];
  
  export default messages;