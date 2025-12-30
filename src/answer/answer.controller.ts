import { Controller, Get, NotFoundException, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AnswerService } from './answer.service';
import { FindByQuestionIdAndRoomIdDto } from './dto/find.dto';
import { RoomService } from 'src/room/room.service';

@UseGuards(JwtAuthGuard)
@Controller('answer')
export class AnswerController {
    constructor(private readonly answerService: AnswerService, private readonly roomService: RoomService) {}
    @Get('findAllByQuestionIdAndRoomCode')
    async findAllByQuestionIdAndRoomCode(
        @Query() query: FindByQuestionIdAndRoomIdDto
    ) {
        const { questionId, roomCode } = query;
        console.log(`{ questionId, roomCode } = { ${questionId}, ${roomCode} }`)
        const room = await this.roomService.findAvailableByCode(roomCode)
        if (!room) {
            console.log("No available room found with this code.")
            throw new NotFoundException("No available room found with this code");
        }
        const answers = await this.answerService.findAllByQuestionIdAndRoomId(questionId, room.id);
        if (!answers || answers.length === 0) {
            console.log("No answers found.")
            throw new NotFoundException("No answers found.");
        }
        return answers;
    }
}
